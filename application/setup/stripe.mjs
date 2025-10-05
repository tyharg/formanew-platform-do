import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import fs from 'fs/promises';
import path from 'path';
import Stripe from 'stripe';

const rl = createInterface({ input, output });

const created = {
  features: [],
  products: [],
  prices: [],
};

function validateKeyFormat(key) {
  return /^sk_test_/.test(key);
}

async function readConfigFile() {
  try {
    const file = await fs.readFile(path.resolve('./setup/stripe-config.json'), 'utf8');
    return JSON.parse(file);
  } catch (err) {
    console.error('❌ Failed to read stripe-config.json.');
    throw err;
  }
}

async function attachFeatureToProduct(stripeSecret, productId, featureId, productName, featureKey) {
  const response = await fetch(`https://api.stripe.com/v1/products/${productId}/features`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      entitlement_feature: featureId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (errorData.error?.message?.includes('already attached')) {
      console.log(`✅ Feature "${featureKey}" is already associated to product "${productName}".`);
    } else {
      throw new Error(`Stripe API Error: ${errorData.error?.message}`);
    }
  } else {
    console.log(`🔗 Feature "${featureKey}" associated successfully to product "${productName}".`);
  }
}

async function createFeatures(stripe, featuresConfig) {
  const createdFeatures = new Map();

  for (const feat of featuresConfig) {
    console.log(`🔧 Creating feature "${feat.name}"...`);
    try {
      const feature = await stripe.entitlements.features.create({
        name: feat.name,
        lookup_key: feat.key,
      });
      created.features.push(feature.id);
      createdFeatures.set(feat.key, feature.id);
    } catch (err) {
      if (err?.raw?.type === 'invalid_request_error' && err?.raw?.message?.includes('lookup_key')) {
        try {
          const { data } = await stripe.entitlements.features.list({ limit: 100 });
          const existing = data.find((f) => f.lookup_key === feat.key);
          if (!existing) {
            throw new Error(`Feature "${feat.name}" not found after conflict.`);
          }
          createdFeatures.set(feat.key, existing.id);
          created.features.push(existing.id);
          console.log(`✅ Feature "${feat.name}" already exists.`);
        } catch (retrieveErr) {
          console.error(`❌ Failed to retrieve existing feature "${feat.name}"`);
          throw retrieveErr;
        }
      } else {
        console.error(`❌ Failed to create feature "${feat.name}"`);
        throw err;
      }
    }
  }

  return createdFeatures;
}

async function createProductsAndPrices(stripe, productsConfig, featuresMap, stripeSecret) {
  const priceEnvVars = {};

  for (const productConfig of productsConfig) {
    console.log(`🛒 Creating product "${productConfig.name}"...`);
    let productId;
    try {
      const product = await stripe.products.create({
        name: productConfig.name,
        description: productConfig.description,
      });
      productId = product.id;
    } catch (err) {
      if (err?.raw?.code === 'resource_already_exists') {
        console.log(`✅ Product "${productConfig.name}" already exists.`);
        const existing = (await stripe.products.list({ limit: 100 })).data.find(
          (p) => p.name === productConfig.name
        );
        if (!existing) throw new Error(`Product "${productConfig.name}" not found after conflict.`);
        productId = existing.id;
      } else {
        throw err;
      }
    }

    const basePrice = await stripe.prices.create({
      unit_amount: productConfig.price,
      currency: productConfig.currency,
      recurring: { interval: productConfig.interval },
      product: productId,
    });
    created.products.push({ id: productId, plan: productConfig.plan, price: basePrice.id });
    created.prices.push(basePrice.id);

    let envVarKey = `STRIPE_${productConfig.id.toUpperCase()}_PRICE_ID`;

    priceEnvVars[envVarKey] = basePrice.id;
    if (productConfig.giftable) {
      const giftPrice = await stripe.prices.create({
        unit_amount: 0,
        currency: productConfig.currency,
        recurring: { interval: productConfig.interval },
        product: productId,
      });
      created.prices.push(giftPrice.id);
      let giftEnvVarKey = `STRIPE_${productConfig.id.toUpperCase()}_GIFT_PRICE_ID`;
      priceEnvVars[giftEnvVarKey] = giftPrice.id;
    }

    for (const featKey of productConfig.features) {
      const featureId = featuresMap.get(featKey);
      if (!featureId) {
        console.warn(`⚠️ Feature "${featKey}" not found in feature map`);
        continue;
      }

      console.log(`🔗 Attaching feature "${featKey}" to "${productConfig.name}"...`);
      await attachFeatureToProduct(stripeSecret, productId, featureId, productConfig.name, featKey);
    }
  }

  return priceEnvVars;
}

async function configureBillingPortal(stripe) {
  // Create config with needed features
  const portalConfig = await stripe.billingPortal.configurations.create({
    business_profile: { headline: 'SeaNotes' },
    features: {
      subscription_cancel: { enabled: false },
      payment_method_update: { enabled: true },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price'],
        products: created.products.map((p) => ({
          product: p.id,
          prices: [p.price],
        })),
      },
      invoice_history: { enabled: true },
      customer_update: { enabled: false },
    },
  });

  console.log(`✅ Created Billing Portal config (${portalConfig.id})`);
  return portalConfig.id;
}

async function updateEnvFile(envVars) {
  const envPath = path.resolve('./.env');
  let envContent = '';

  try {
    envContent = await fs.readFile(envPath, 'utf8');
  } catch {
    console.warn('⚠️  .env file not found.');
    const answer = (await rl.question('Do you want to create it? (y/n): ')).trim().toLowerCase();
    if (answer !== 'y') {
      console.log('Aborted by user. Exiting.');
      process.exit(1);
    }
    envContent = '';
  }

  const lines = envContent.split('\n');
  const lineMap = {};
  lines.forEach((line, idx) => {
    const match = line.match(/^([A-Z0-9_]+)\s*=/);
    if (match) lineMap[match[1]] = idx;
  });

  for (const [key, value] of Object.entries(envVars)) {
    if (key in lineMap) {
      lines[lineMap[key]] = `${key}=${value}`;
    } else {
      lines.push(`${key}=${value}`);
    }
  }

  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();

  await fs.writeFile(envPath, lines.join('\n') + '\n', 'utf8');
  console.log('📄 .env file updated successfully!');
}

async function rollback(stripe) {
  console.log('\n⏪ Rolling back...');

  for (const priceId of [...created.prices].reverse()) {
    try {
      await stripe.prices.update(priceId, { active: false });
      console.log(`🗑️ Deactivated price ${priceId}`);
    } catch (err) {
      console.warn(`⚠️ Could not deactivate price ${priceId}: ${err.message}`);
    }
  }

  for (const product of [...created.products].reverse()) {
    try {
      await stripe.products.update(product.id, { active: false });
      console.log(`🗑️ Deactivated product ${product.id}`);
    } catch (err) {
      console.warn(`⚠️ Could not deactivate product ${product.id}: ${err.message}`);
    }
  }

  for (const featureId of [...created.features].reverse()) {
    try {
      await stripe.entitlements.features.update(featureId, { active: false });
      console.log(`🗑️ Deactivated feature ${featureId}`);
    } catch (err) {
      console.warn(`⚠️ Could not deactivate feature ${featureId}: ${err.message}`);
    }
  }

  console.log('🔁 Rollback complete.\n');
}

/**
 * Main entry point for Stripe Billing Setup.
 * This function guides the user through setting up Stripe billing products, features, and portal configuration.
 */
async function main() {
  console.log('🚀 Stripe Billing Setup');
  console.log('This script assumes a clean Stripe account with no existing billing setup.\n');

  const secretKey = (
    await rl.question('👉 Enter your Stripe Secret Key (starts with sk_test_): ')
  ).trim();
  if (!validateKeyFormat(secretKey)) {
    console.error('❌ Invalid key format. It must start with sk_test_');
    process.exit(1);
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2024-04-10' });

  try {
    await stripe.products.list({ limit: 1 });
    console.log('✅ Stripe key is valid.\n');
  } catch (err) {
    console.error('❌ Stripe authentication failed.');
    console.error(err.message);
    process.exit(1);
  }

  try {
    const config = await readConfigFile();
    const featuresMap = await createFeatures(stripe, config.features);
    console.log('✅ All features created.\n');

    const priceEnvVars = await createProductsAndPrices(
      stripe,
      config.products,
      featuresMap,
      secretKey
    );
    console.log('✅ All products and prices created.\n');

    const portalConfigId = await configureBillingPortal(stripe, created.products);
    const allVars = {
      ...priceEnvVars,
      STRIPE_SECRET_KEY: secretKey,
      STRIPE_PORTAL_CONFIG_ID: portalConfigId,
    };
    await updateEnvFile(allVars);
  } catch (err) {
    console.error('❌ Setup failed:');
    console.error(err.message || err);
    await rollback(stripe);
    process.exit(1);
  }

  rl.close();
}

main();
