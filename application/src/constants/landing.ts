/**
 * Constants for landing page components
 * Centralizes colors, URLs, dimensions, and other hardcoded values
 */

// Brand and UI Colors
export const COLORS = {
  // CTA Button Colors
  github: '#000000',
  githubHover: '#333333',
  deploy: '#0069ff',
  deployHover: '#0056cc',
  
  // Feature Card Icon Colors
  llcFormation: '#1e88e5',
  registeredAgent: '#43a047',
  einSetup: '#8e24aa',
  banking: '#fb8c00',
  nameCheck: '#5e35b1',
  estimator: '#00897b',
  compliance: '#3949ab',
  contracts: '#f4511e',
  invoicing: '#6d4c41',
} as const;

// External URLs
export const URLS = {
  // Repository and Deployment
  githubRepo: 'https://github.com/digitalocean/sea-notes-saas-starter-kit',
  deployment: 'https://cloud.digitalocean.com/apps/new?repo=https://github.com/digitalocean/sea-notes-saas-starter-kit/tree/main',
  
  // DigitalOcean Services
  appPlatform: 'https://www.digitalocean.com/products/app-platform',
  spaces: 'https://www.digitalocean.com/products/spaces',
  databases: 'https://www.digitalocean.com/products/managed-databases',
  gradient: 'https://www.digitalocean.com/products/gradientai',
  functions: 'https://www.digitalocean.com/products/functions',
  
  // Support and Community
  support: 'https://www.digitalocean.com/support',
  twitter: 'https://twitter.com/digitalocean',
  community: 'https://www.digitalocean.com/community',
  status: 'https://status.digitalocean.com',
  documentation: 'https://docs.digitalocean.com',
} as const;

// Component Dimensions
export const DIMENSIONS = {
  // Icon Sizes
  iconSize: {
    small: 16,
    large: 40,
  },
  
  // Feature Card Icon Container
  iconContainer: {
    width: 80,
    height: 80,
  },
  
  // Terminal Mock Dots
  terminalDot: {
    width: 12,
    height: 12,
  },
  
  // Spacing Values
  spacing: {
    section: 8,      // py={8} for sections
    card: 6,         // py={6} for cards
    container: 4,    // gap={4} for containers
    stack: 3,        // spacing={3} for stacks
    small: 2,        // spacing={2} for small elements
    tiny: 1.5,       // spacing={1.5} for tight elements
  },
  
  // Layout Dimensions
  layout: {
    terminalWidth: 500,
    sidebarWidth: 240,
    minHeight: 400,
    maxContentWidth: 600,
  },
} as const;

// Terminal Commands
export const TERMINAL = {
  commands: [
    '$ git clone https://github.com/digitalocean/sea-notes-saas-starter-kit.git',
    '$ cd sea-notes-saas-starter-kit', 
    '$ npm install',
    '$ npm run dev'
  ].join('\n'),
} as const;

// Feature Data
export const FEATURES = [
  {
    title: 'LLC Formation in Any State',
    description: 'File your company with streamlined steps and transparent, state-specific fees.',
    color: COLORS.llcFormation,
  },
  {
    title: 'Registered Agent Included',
    description: '50-state RA coverage with same-day activation and document forwarding.',
    color: COLORS.registeredAgent,
  },
  {
    title: 'Fast EIN Setup',
    description: 'We guide your IRS EIN application so you can open accounts and invoice.',
    color: COLORS.einSetup,
  },
  {
    title: 'Bank + Payments Setup',
    description: 'Get a business bank account and Stripe connected so you can accept money day one.',
    color: COLORS.banking,
  },
  {
    title: 'Business Name Check',
    description: 'Instant state-level availability check plus smart name suggestions.',
    color: COLORS.nameCheck,
  },
  {
    title: 'State Fee & Timeline Estimator',
    description: 'See total costs and average turnaround times before you file.',
    color: COLORS.estimator,
  },
  {
    title: 'Compliance Autopilot',
    description: 'Annual reports, RA renewals, deadlines—tracked and reminded automatically.',
    color: COLORS.compliance,
  },
  {
    title: 'Contracts & E-Sign',
    description: 'Click-to-use templates (MSA, SOW, NDA) with built-in e-signature and storage.',
    color: COLORS.contracts,
  },
  {
    title: 'Invoicing & Payouts',
    description: 'Create invoices, accept cards/ACH, and track who’s paid—recurring or one-off.',
    color: COLORS.invoicing,
  },
] as const;
