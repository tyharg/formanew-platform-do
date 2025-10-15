import { USER_ROLES } from 'lib/auth/roles';

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  image: string | null;

  role: UserRole;
  createdAt: Date;

  verificationToken?: string | null;
  emailVerified: boolean;

  companies?: Company[];
}

// Subscription type
export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus | null;
  plan: SubscriptionPlan | null;
  customerId: string | null;
  createdAt: Date;
}

// Note type
export interface Note {
  id: string;
  userId: string;
  companyId: string | null;
  title: string;
  content: string;
  createdAt: Date;
}

export interface Company {
  id: string;
  userId: string;
  legalName: string;
  displayName: string | null;
  industry: string | null;
  ein: string | null;
  formationDate: Date | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  contracts?: Contract[];
  contacts?: CompanyContact[];
  notes?: CompanyNote[];
  finance?: CompanyFinance | null;
}

export interface Contract {
  id: string;
  companyId: string;
  title: string;
  counterpartyName: string;
  counterpartyEmail: string | null;
  contractValue: number | null;
  currency: string | null;
  status: ContractStatus;
  startDate: Date | null;
  endDate: Date | null;
  signedDate: Date | null;
  paymentTerms: string | null;
  renewalTerms: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  files?: StoredFile[];
  workItems?: WorkItem[];
  relevantParties?: RelevantParty[];
}

export interface CompanyContact {
  id: string;
  companyId: string;
  fullName: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyNote {
  id: string;
  companyId: string;
  authorName: string | null;
  content: string;
  createdAt: Date;
}

export interface StoredFile {
  id: string;
  ownerType: string;
  ownerId: string;
  name: string;
  description: string | null;
  contentType: string | null;
  size: number | null;
  storageKey: string | null;
  contractId: string | null;
  createdAt: Date;
  updatedAt: Date;
  downloadUrl?: string;
}

export interface WorkItem {
  id: string;
  contractId: string;
  title: string;
  description: string | null;
  status: WorkItemStatus;
  dueDate: Date | null;
  completedAt: Date | null;
  position: number;
  linkedFileId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelevantParty {
  id: string;
  contractId: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string | null;
  magicLinkToken: string | null;
  magicLinkExpiresAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyFinance {
  id: string;
  companyId: string;
  stripeAccountId: string | null;
  accountOnboardingUrl: string | null;
  accountOnboardingExpiresAt: Date | null;
  accountLoginLinkUrl: string | null;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirementsDue: string[];
  requirementsDueSoon: string[];
  createdAt: Date;
  updatedAt: Date;
  // Added for the product demo store
  products: { productId: string, priceId: string }[];
}

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PENDING';

export type SubscriptionPlan = 'FREE' | 'PRO';

export interface UserWithSubscriptions extends User {
  subscription: Subscription | null;
}

export enum SubscriptionStatusEnum {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PENDING = 'PENDING',
}

export enum SubscriptionPlanEnum {
  FREE = 'FREE',
  PRO = 'PRO',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PENDING_SIGNATURE = 'PENDING_SIGNATURE',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED',
}

export enum FinanceLineItemType {
  INFLOW = 'INFLOW',
  OUTFLOW = 'OUTFLOW',
}

export interface FinanceLineItem {
  id: string;
  companyId: string;
  type: FinanceLineItemType;
  amount: bigint;
  currency: string;
  occurredAt: Date;
  description: string | null;
  category: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum WorkItemStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
}
