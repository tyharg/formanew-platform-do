'use client';

import React, { FormEvent, useState } from 'react';

const sectionStyle: React.CSSProperties = {
  border: '1px solid #d0d7de',
  borderRadius: '8px',
  padding: '1.5rem',
  marginBottom: '1.5rem',
  backgroundColor: '#fff',
};

const headingStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '0.75rem',
  fontSize: '1.5rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  marginBottom: '0.25rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid #d0d7de',
  marginBottom: '0.75rem',
};

const buttonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.6rem 1.25rem',
  borderRadius: '6px',
  border: '1px solid transparent',
  backgroundColor: '#1976d2',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#fff',
  color: '#1976d2',
  borderColor: '#1976d2',
};

const codeBlockStyle: React.CSSProperties = {
  background: '#f6f8fa',
  borderRadius: '6px',
  padding: '0.75rem',
  fontFamily: 'monospace',
  fontSize: '0.9rem',
  overflowX: 'auto',
};

const resultStyle: React.CSSProperties = {
  marginTop: '0.75rem',
  padding: '0.75rem',
  borderRadius: '6px',
  backgroundColor: '#f1f8ff',
  border: '1px solid #d0d7de',
  wordBreak: 'break-word',
};

interface ProductSummary {
  id: string;
  name: string;
  description: string;
  priceId: string;
  unitAmount: number | null;
  currency: string | null;
}

interface CheckoutPreview {
  accountId: string;
  sessionUrl: string;
}

export default function ConnectDemoClient() {
  const [onboardingResult, setOnboardingResult] = useState<{ accountId: string; onboardingUrl: string } | null>(null);
  const [accountStatus, setAccountStatus] = useState<Record<string, unknown> | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string>('');
  const [productMessage, setProductMessage] = useState<string | null>(null);
  const [checkoutPreview, setCheckoutPreview] = useState<CheckoutPreview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (amount: number | null, currency: string | null) => {
    if (amount === null || currency === null) {
      return 'Price not set';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  async function handleOnboard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setOnboardingResult(null);
    try {
      const form = new FormData(event.currentTarget);
      const email = form.get('email');
      const response = await fetch('/api/connect/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to create a Connect account.');
      }
      setOnboardingResult({ accountId: payload.accountId, onboardingUrl: payload.onboardingUrl });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong while creating the account.';
      setOnboardingResult({ accountId: 'n/a', onboardingUrl: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFetchStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusError(null);
    setAccountStatus(null);
    try {
      const form = new FormData(event.currentTarget);
      const accountId = String(form.get('statusAccountId') || '').trim();
      if (!accountId) {
        throw new Error('Enter the connected account ID you received earlier (looks like acct_...).');
      }
      const response = await fetch(`/api/connect/accounts/${accountId}/status`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to retrieve account status.');
      }
      setAccountStatus(payload as Record<string, unknown>);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : 'Could not load the account status.');
    }
  }

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductMessage(null);
    try {
      const form = new FormData(event.currentTarget);
      const accountId = String(form.get('productAccountId') || '').trim();
      const name = String(form.get('name') || '').trim();
      const description = String(form.get('description') || '').trim();
      const amount = Number(form.get('amount'));
      const currency = String(form.get('currency') || '').trim();

      if (!accountId || !name || !currency || Number.isNaN(amount)) {
        throw new Error('Account ID, product name, price, and currency are required.');
      }

      const response = await fetch(`/api/connect/accounts/${accountId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, amount, currency }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to create product.');
      }
      setProductMessage(`Product ${payload.productId} created successfully. Default price: ${payload.defaultPrice}`);
      event.currentTarget.reset();
    } catch (error) {
      setProductMessage(error instanceof Error ? error.message : 'Could not create the product.');
    }
  }

  async function handleListProducts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProducts([]);
    setCheckoutPreview(null);
    try {
      const form = new FormData(event.currentTarget);
      const accountId = String(form.get('listAccountId') || '').trim();
      if (!accountId) {
        throw new Error('Enter the connected account ID to list products.');
      }
      const response = await fetch(`/api/connect/accounts/${accountId}/products`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to load products.');
      }
      const rawProducts = Array.isArray(payload.products) ? payload.products : [];
      const mappedProducts: ProductSummary[] = rawProducts.map((product: Record<string, unknown>) => ({
        id: typeof product.id === 'string' ? product.id : '',
        name: typeof product.name === 'string' ? product.name : 'Unnamed product',
        description: typeof product.description === 'string' ? product.description : '',
        priceId: typeof product.defaultPriceId === 'string' ? product.defaultPriceId : '',
        unitAmount: typeof product.unitAmount === 'number' ? product.unitAmount : null,
        currency: typeof product.currency === 'string' ? product.currency : null,
      }));
      setProducts(mappedProducts);
      setCurrentAccountId(accountId);
    } catch (error) {
      setProductMessage(error instanceof Error ? error.message : 'Could not load products.');
    }
  }

  async function handleCreateCheckout(accountId: string, priceId: string) {
    setCheckoutPreview(null);
    if (!accountId) {
      setProductMessage('Load products for a connected account before starting Checkout.');
      return;
    }
    if (!priceId) {
      setProductMessage('The selected product is missing a default price.');
      return;
    }
    try {
      const response = await fetch(`/api/connect/accounts/${accountId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to create Checkout session.');
      }
      setCheckoutPreview({ accountId, sessionUrl: payload.url });
      window.location.href = payload.url;
    } catch (error) {
      setProductMessage(error instanceof Error ? error.message : 'Checkout failed to initialise.');
    }
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Stripe Connect Sample</h1>
      <p style={{ marginBottom: '2rem' }}>
        Follow the steps below to onboard a connected account, create products, and sell them through Hosted Checkout.
        Remember to replace the placeholder environment variables (such as <code>STRIPE_SECRET_KEY</code> and
        <code>NEXT_PUBLIC_BASE_URL</code>) with values from your own Stripe account.
      </p>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>1. Onboard to Collect Payments</h2>
        <p>Provide an email (optional) and we&apos;ll create a new Connect account plus an onboarding link.</p>
        <form onSubmit={handleOnboard} style={{ marginTop: '1rem' }}>
          <label style={labelStyle} htmlFor="email">
            Contact email (optional)
          </label>
          <input id="email" name="email" type="email" placeholder="founder@example.com" style={inputStyle} />
          <button type="submit" style={buttonStyle} disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account & generate onboarding link'}
          </button>
        </form>
        {onboardingResult && (
          <div style={resultStyle}>
            <p><strong>Account ID:</strong> {onboardingResult.accountId}</p>
            <p>
              <strong>Onboarding URL:</strong>{' '}
              <a href={onboardingResult.onboardingUrl} target="_blank" rel="noreferrer">
                {onboardingResult.onboardingUrl}
              </a>
            </p>
            <p style={{ fontSize: '0.85rem', color: '#555' }}>
              The account link expires quickly. Open it in a new tab and complete onboarding straight away.
            </p>
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>2. Check Onboarding Status</h2>
        <p>Paste any connected account ID to see its live status directly from Stripe.</p>
        <form onSubmit={handleFetchStatus} style={{ marginTop: '1rem' }}>
          <label style={labelStyle} htmlFor="statusAccountId">
            Connected account ID (acct_...)
          </label>
          <input id="statusAccountId" name="statusAccountId" placeholder="acct_123" style={inputStyle} />
          <button type="submit" style={secondaryButtonStyle}>
            Fetch status
          </button>
        </form>
        {statusError && <div style={{ ...resultStyle, backgroundColor: '#fdecea', borderColor: '#f0b1a1' }}>{statusError}</div>}
        {accountStatus && (
          <pre style={codeBlockStyle}>{JSON.stringify(accountStatus, null, 2)}</pre>
        )}
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>3. Create a Product on the Connected Account</h2>
        <p>Products are created with the Stripe-Account header so they live on the connected account.</p>
        <form onSubmit={handleCreateProduct} style={{ marginTop: '1rem' }}>
          <label style={labelStyle} htmlFor="productAccountId">
            Connected account ID (acct_...)
          </label>
          <input id="productAccountId" name="productAccountId" placeholder="acct_123" style={inputStyle} required />

          <label style={labelStyle} htmlFor="name">
            Product name
          </label>
          <input id="name" name="name" placeholder="Premium Support" style={inputStyle} required />

          <label style={labelStyle} htmlFor="description">
            Description
          </label>
          <textarea id="description" name="description" placeholder="Monthly access to premium support." style={{ ...inputStyle, minHeight: '100px' }} />

          <label style={labelStyle} htmlFor="amount">
            Price (major units)
          </label>
          <input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="29.99" style={inputStyle} required />

          <label style={labelStyle} htmlFor="currency">
            Currency (ISO code)
          </label>
          <input id="currency" name="currency" placeholder="usd" style={inputStyle} defaultValue="usd" required />

          <button type="submit" style={buttonStyle}>
            Create product
          </button>
        </form>
        {productMessage && <div style={resultStyle}>{productMessage}</div>}
      </section>

      <section style={sectionStyle}>
        <h2 style={headingStyle}>4. Browse Products & Start Checkout</h2>
        <p>List products for a connected account, then kick off a Hosted Checkout session with an application fee.</p>
        <form onSubmit={handleListProducts} style={{ marginTop: '1rem' }}>
          <label style={labelStyle} htmlFor="listAccountId">
            Connected account ID (acct_...)
          </label>
          <input id="listAccountId" name="listAccountId" placeholder="acct_123" style={inputStyle} required />
          <button type="submit" style={secondaryButtonStyle}>
            Load products
          </button>
        </form>

        {products.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
            {products.map((product) => (
              <div key={product.id} style={{ ...resultStyle, backgroundColor: '#fff' }}>
                <h3 style={{ marginTop: 0 }}>{product.name}</h3>
                <p style={{ marginBottom: '0.75rem' }}>{product.description || 'No description provided.'}</p>
                <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{formatPrice(product.unitAmount, product.currency)}</p>
                <button
                  style={buttonStyle}
                  onClick={() => handleCreateCheckout(currentAccountId, product.priceId)}
                >
                  Start Checkout
                </button>
                <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '0.5rem' }}>
                  Default price ID: <code>{product.priceId || 'n/a'}</code>
                </p>
              </div>
            ))}
          </div>
        )}

        {checkoutPreview && (
          <div style={resultStyle}>
            <p>
              Redirecting to Checkout for <strong>{checkoutPreview.accountId}</strong>…
            </p>
            <p>
              If you are not redirected automatically, <a href={checkoutPreview.sessionUrl}>click here</a>.
            </p>
          </div>
        )}

        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#555' }}>
          Tip: You can also visit <code>/connect-demo/store/&lt;accountId&gt;</code> to see a simple public storefront.
        </p>
      </section>
    </div>
  );
}
