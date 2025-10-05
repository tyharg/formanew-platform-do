/* eslint-disable @typescript-eslint/no-unused-vars */
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';

const rl = createInterface({ input, output });
const execPromise = util.promisify(exec);

async function checkDoctlInstalled() {
  try {
    await execPromise('doctl version');
    return true;
  } catch {
    return false;
  }
}

async function checkDoctlAuthenticated() {
  try {
    await execPromise('doctl account get');
    return true;
  } catch {
    return false;
  }
}

async function doctlAuthenticate() {
  console.log('\nTo authenticate doctl, you need a DigitalOcean API Token.');
  console.log('You can create one at: https://cloud.digitalocean.com/account/api/tokens\n');
  const token = await rl.question(
    'Paste your API Token here (it will NOT be displayed as you type): '
  );
  try {
    const { stdout } = await execPromise(`doctl auth init -t "${token.trim()}"`);
    console.log(stdout);
    return true;
  } catch (err) {
    console.error('\n❌ Authentication failed. Please check your API token.');
    return false;
  }
}

// Extract app name with regex (no deps)
async function getAppNameFromYaml() {
  try {
    const file = await fs.readFile('app.yaml', 'utf8');
    const match = file.match(/^\s*name:\s*(.+)\s*$/m);
    if (match) {
      return match[1].trim();
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Find app by name in list
async function findAppIdByName(appName) {
  try {
    const { stdout } = await execPromise('doctl apps list --output json');
    const apps = JSON.parse(stdout);
    const app = apps.find((a) => a.spec?.name === appName);
    return app ? app.id : null;
  } catch {
    return null;
  }
}

async function main() {
  console.log(`
--- DigitalOcean App Platform Deployment ---

To deploy, you need:
  1. DigitalOcean CLI (doctl) installed globally
  2. Authenticated via API Token

This script will guide you if anything is missing.
  `);

  const hasDoctl = await checkDoctlInstalled();
  if (!hasDoctl) {
    console.log('\n❌ DigitalOcean CLI (doctl) is NOT installed.');
    console.log('Install with:');
    console.log('  brew install doctl   # Mac');
    console.log('  choco install doctl  # Windows');
    console.log('  snap install doctl   # Linux\n');
    process.exit(1);
  }

  let isAuthenticated = await checkDoctlAuthenticated();
  if (!isAuthenticated) {
    const confirm = await rl.question(
      '\ndoctl is not authenticated. Would you like to authenticate now? (y/n): '
    );
    if (confirm.trim().toLowerCase().startsWith('y')) {
      isAuthenticated = await doctlAuthenticate();
      if (!isAuthenticated) {
        console.log('Exiting...');
        process.exit(1);
      }
    } else {
      console.log('Authentication required. Exiting...');
      process.exit(1);
    }
  }

  try {
    console.log('\n🚀 Deploying app using: doctl apps create --spec app.yaml ...\n');
    const { stdout, stderr } = await execPromise('doctl apps create --spec app.yaml');
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log(
      '\n✅ App created and deployment started! You can monitor your deployment status in the DigitalOcean App Platform dashboard:\n  https://cloud.digitalocean.com/apps\n'
    );
    rl.close();
    process.exit(0);
  } catch (err) {
    if (err.stderr && /already exists/i.test(err.stderr)) {
      const appName = await getAppNameFromYaml();
      if (!appName) {
        console.error('\n❌ App already exists, but could not extract app name from app.yaml.');
        rl.close();
        process.exit(1);
      }
      console.log(`\n⚠️  App "${appName}" already exists in your DigitalOcean account.`);
      const update = await rl.question('Do you want to update the existing app instead? (y/n): ');
      if (!update.trim().toLowerCase().startsWith('y')) {
        console.log('Deployment cancelled by user.');
        rl.close();
        process.exit(0);
      }
      const appId = await findAppIdByName(appName);
      if (!appId) {
        console.error('\n❌ Could not find app ID for update.');
        rl.close();
        process.exit(1);
      }
      try {
        console.log(
          `\n🔄 Updating app "${appName}" (${appId}) using: doctl apps update ${appId} --spec app.yaml ...\n`
        );
        const { stdout, stderr } = await execPromise(`doctl apps update ${appId} --spec app.yaml`);
        console.log(stdout);
        if (stderr) console.error(stderr);
        console.log(
          '\n✅ App update successful! You can monitor your deployment status in the DigitalOcean App Platform dashboard:\n  https://cloud.digitalocean.com/apps\n'
        );
      } catch (updateErr) {
        console.error('\n❌ Update failed:', updateErr.stderr || updateErr.message);
      }
      rl.close();
      process.exit(0);
    } else {
      console.error('\n❌ Deployment failed:', err.stderr || err.message);
      rl.close();
      process.exit(1);
    }
  }
}

main();
