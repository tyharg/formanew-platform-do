import { Company, CompanyFinance } from '@/types';

// Mock Database Store
// In a real application, this would be a database (e.g., PostgreSQL, MongoDB)
const mockCompanies: Record<string, Company> = {
  'comp_12345': {
    id: 'comp_12345',
    userId: 'user_abc',
    legalName: 'Acme Corp',
    displayName: 'Acme',
    industry: 'Software',
    ein: null,
    formationDate: new Date(),
    website: null,
    phone: null,
    email: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: null,
    postalCode: null,
    country: null,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    finance: {
      id: 'finance_1',
      companyId: 'comp_12345',
      stripeAccountId: null, // Initially null
      accountOnboardingUrl: null,
      accountOnboardingExpiresAt: null,
      accountLoginLinkUrl: null,
      detailsSubmitted: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      requirementsDue: [],
      requirementsDueSoon: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      products: [], // Added for product demo
    },
  },
};

/**
 * Retrieves a company by ID.
 */
export async function getCompanyById(companyId: string): Promise<Company | undefined> {
  // Simulate async DB fetch
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockCompanies[companyId];
}

/**
 * Updates the CompanyFinance record.
 */
export async function updateCompanyFinance(companyId: string, updates: Partial<CompanyFinance>): Promise<CompanyFinance> {
  // Simulate async DB update
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const company = mockCompanies[companyId];
  if (!company || !company.finance) {
    // Initialize finance record if missing (for robustness in demo)
    company.finance = {
        id: `finance_${companyId}`,
        companyId: companyId,
        stripeAccountId: null,
        accountOnboardingUrl: null,
        accountOnboardingExpiresAt: null,
        accountLoginLinkUrl: null,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        requirementsDue: [],
        requirementsDueSoon: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
    };
  }

  company.finance = {
    ...company.finance,
    ...updates,
    updatedAt: new Date(),
  };

  return company.finance;
}

/**
 * Adds a product to the company's finance record (for demo purposes).
 */
export async function addProductToCompany(companyId: string, productId: string, priceId: string): Promise<void> {
    const company = mockCompanies[companyId];
    if (!company || !company.finance) {
        throw new Error('Company or finance record not found.');
    }

    if (!company.finance.products) {
        company.finance.products = [];
    }

    company.finance.products.push({ productId, priceId });
}

/**
 * Retrieves all products associated with a company (for demo purposes).
 */
export async function getCompanyProducts(companyId: string): Promise<{ productId: string, priceId: string }[]> {
    const company = mockCompanies[companyId];
    if (!company || !company.finance || !company.finance.products) {
        return [];
    }
    return company.finance.products;
}
