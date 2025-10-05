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
  deployment: '#795548',
  cloud: '#00bcd4', 
  ai: '#e91e63',
  database: '#4caf50',
  payment: '#ff9800',
  security: '#f44336',
  email: '#9c27b0',
  admin: '#607d8b',
  monitoring: '#4caf50',
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
    title: 'One-Click Deployment',
    description: 'Deploy directly to DigitalOcean App Platform with automated setup and configuration.',
    color: COLORS.deployment,
  },
  {
    title: 'DigitalOcean Spaces',
    description: 'File storage and CDN integration using DigitalOcean Spaces.',
    color: COLORS.cloud,
  },
  {
    title: 'DigitalOcean Gradient',
    description: 'AI-powered invoice generation using DigitalOcean\'s Serverless Inference API.',
    color: COLORS.ai,
  },
  {
    title: 'PostgreSQL and Prisma ORM',
    description: 'Database used for efficient data management and scalability.',
    color: COLORS.database,
  },
  {
    title: 'Stripe Integration',
    description: 'Used for subscription management.',
    color: COLORS.payment,
  },
  {
    title: 'NextAuth Authentication',
    description: 'Built-in authentication system for better user management.',
    color: COLORS.security,
  },
  {
    title: 'Resend Email Service',
    description: 'Email service used for sending authentication emails as well as invoices.',
    color: COLORS.email,
  },
  {
    title: 'Admin Dashboard',
    description: 'Complete admin interface for managing users, subscriptions, and system monitoring.',
    color: COLORS.admin,
  },
  {
    title: 'System Health Monitoring',
    description: 'Real-time monitoring of all services including database, email, storage, and AI services.',
    color: COLORS.monitoring,
  },
] as const;