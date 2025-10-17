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

export enum IncorporationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
}

export interface Incorporation {
  id: string;
  companyId: string;
  status: IncorporationStatus;
  businessSubType: string | null;
  nameReserved: boolean | null;
  llcName: string | null;
  confirmLlcName: string | null;
  consentToUseName: string | null;
  dbaDifferent: boolean | null;
  businessDetailsId: string | null;
  businessAddressId: string | null;
  registeredAgentId: string | null;
  companyDetailsId: string | null;
  attestationId: string | null;
  primaryContactId: string | null;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessAddress {
  id: string;
  principalAddress: string | null;
  principalSteAptFl: string | null;
  principalAttention: string | null;
  principalCity: string | null;
  principalState: string | null;
  principalZip: string | null;
  principalCountry: string | null;
  mailingAddress: string | null;
  mailingSteAptFl: string | null;
  mailingAttention: string | null;
  mailingCity: string | null;
  mailingState: string | null;
  mailingZip: string | null;
  mailingCountry: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
}

export interface RegisteredAgent {
  id: string;
  name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  certified: boolean | null;
  acceptanceForm: string | null;
  formationLocale: string | null;
}

export interface IncorporationCompanyDetails {
  id: string;
  durationType: string | null;
  durationDate: Date | null;
  purposeStatement: string | null;
}

export interface IncorporationBusinessDetails {
  id: string;
  formationState: string | null;
  formationCounty: string | null;
  effectiveDate: Date | null;
  hasForeignQualification: boolean | null;
  foreignJurisdictions: string | null;
  managementStructure: string | null;
}

export interface IncorporationPrimaryContact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
}

export interface IncorporationMember {
  id: string;
  incorporationId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  ownershipPercentage: number | null;
  isManager: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attestation {
  id: string;
  infoIsPublic: boolean | null;
  authorizedToFile: boolean | null;
  swornTrue: boolean | null;
  organizerTitle: string | null;
  organizerName: string | null;
  organizerAddress: string | null;
  signerCapacity: string | null;
  onBehalfOf: string | null;
  signature: string | null;
  dateSigned: Date | null;
}
