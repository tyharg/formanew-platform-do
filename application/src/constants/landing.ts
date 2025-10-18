/**
 * Constants for landing page components
 * Centralizes colors, URLs, dimensions, and other hardcoded values
 */

// Brand and UI Colors
export const COLORS = {
  // CTA Button Colors
  github: '#1b1b1b',
  githubHover: '#2f2f2f',
  deploy: '#4338ca',
  deployHover: '#3730a3',
  
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
  githubRepo: 'https://github.com/formanew/platform',
  deployment: 'https://formanew.com/contact',

  // Platform resources
  launchGuide: 'https://formanew.com/guide',
  partnerNetwork: 'https://formanew.com/partners',
  helpCenter: 'https://formanew.com/support',
  blog: 'https://formanew.com/blog',

  // Support and Community
  support: 'mailto:support@formanew.com',
  twitter: 'https://x.com/formanew',
  community: 'https://formanew.com/community',
  status: 'https://status.formanew.com',
  documentation: 'https://docs.formanew.com',
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
    title: 'Guided LLC Formation',
    description: 'Step-by-step state filing with name checks and auto-filled forms — no paperwork maze.',
    color: COLORS.llcFormation,
  },
  {
    title: 'Registered Agent Service',
    description: 'Stay compliant in all 50 states with same-day document forwarding and privacy protection.',
    color: COLORS.registeredAgent,
  },
  {
    title: 'EIN & IRS Setup',
    description: 'We handle your EIN registration so you can open a business bank account and start invoicing immediately.',
    color: COLORS.einSetup,
  },
  {
    title: 'Banking & Payments Integration',
    description: 'Connect to Mercury and Stripe to manage accounts, accept ACH and card payments, and track revenue in one dashboard.',
    color: COLORS.banking,
  },
  {
    title: 'Compliance Autopilot',
    description: 'Automatic annual report reminders and filing status checks so you never miss a deadline.',
    color: COLORS.nameCheck,
  },
  {
    title: 'Digital Contracts & E-Signatures',
    description: 'Send, track, and sign legally binding agreements directly inside your FormaNew portal.',
    color: COLORS.estimator,
  },
  {
    title: 'Client Portal',
    description: 'A secure workspace where clients can view proposals, sign contracts, pay invoices, and exchange files — all branded to your LLC.',
    color: COLORS.compliance,
  },
  {
    title: 'Nanomarket — Website & Store Builder',
    description: 'Launch a custom website, and sell services or products through your own white-label commerce platform.',
    color: COLORS.contracts,
  },
  {
    title: 'Business Dashboard & Analytics',
    description: 'Unified view of your filings, invoices, and contracts with performance insights built in.',
    color: COLORS.invoicing,
  },
] as const;
