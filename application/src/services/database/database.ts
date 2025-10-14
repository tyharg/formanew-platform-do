import {
  Note,
  Subscription,
  User,
  UserWithSubscriptions,
  SubscriptionStatus,
  Company,
  Contract,
  CompanyContact,
  CompanyNote,
  CompanyFinance,
} from 'types';
import { ServiceConfigStatus, ConfigurableService } from '../status/serviceConfigStatus';

export type DatabaseProvider = 'Postgres';

export type QueryParams = unknown[];

/**
 * Abstract base class for database clients.
 * Provides a common interface for database operations across different database providers.
 */
export abstract class DatabaseClient implements ConfigurableService {
  abstract user: {
    findById: (id: string) => Promise<User | null>;
    findByEmail: (email: string) => Promise<User | null>;
    findByEmailAndPassword: (email: string, passwordHash: string) => Promise<User | null>;
    findByVerificationToken: (token: string) => Promise<User | null>;
    findAll: (options?: {
      page?: number;
      pageSize?: number;
      searchName?: string;
      filterPlan?: string;
      filterStatus?: string;
    }) => Promise<{ users: UserWithSubscriptions[]; total: number }>;
    create: (user: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
    update: (id: string, user: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<User>;
    delete: (id: string) => Promise<void>;
    count: () => Promise<number>;
    updateByEmail: (email: string, user: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<User>;
  };
  abstract subscription: {
    findByUserAndStatus: (
      userId: string,
      status: SubscriptionStatus
    ) => Promise<Subscription | null>;
    findById: (id: string) => Promise<Subscription | null>;
    findByUserId: (userId: string) => Promise<Subscription[]>;
    create: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => Promise<Subscription>;
    update: (
      userId: string,
      subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>
    ) => Promise<Subscription>;
    updateByCustomerId: (
      customerId: string,
      subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>
    ) => Promise<Subscription>;
    delete: (id: string) => Promise<void>;
  };
  abstract note: {
    findById: (id: string) => Promise<Note | null>;
    findByUserId: (userId: string) => Promise<Note[]>;
    create: (note: Omit<Note, 'id' | 'createdAt'>) => Promise<Note>;
    update: (id: string, note: Partial<Omit<Note, 'id' | 'createdAt'>>) => Promise<Note>;
    delete: (id: string) => Promise<void>;
    findMany: (args: {
      search?: string;
      userId: string;
      companyId: string;
      skip: number;
      take: number;
      orderBy: {
        createdAt?: 'desc' | 'asc';
        title?: 'asc';
      };
    }) => Promise<Note[]>;
    count: (args: { userId: string; companyId: string; search?: string }) => Promise<number>;
  };
  abstract verificationToken: {
    create: (data: { identifier: string; token: string; expires: Date }) => Promise<void>;
    find: (
      identifier: string,
      token: string
    ) => Promise<{ identifier: string; token: string; expires: Date } | null>;
    findByToken: (
      token: string
    ) => Promise<{ identifier: string; token: string; expires: Date } | null>;
    delete: (identifier: string, token: string) => Promise<void>;
    deleteExpired: (now: Date) => Promise<void>;
  };
  abstract company: {
    findById: (id: string) => Promise<Company | null>;
    findByUserId: (userId: string) => Promise<Company[]>;
    create: (
      company: Omit<
        Company,
        'id' | 'createdAt' | 'updatedAt' | 'contracts' | 'contacts' | 'notes' | 'finance'
      >
    ) => Promise<Company>;
    update: (
      id: string,
      company: Partial<
        Omit<
          Company,
          'id' | 'createdAt' | 'updatedAt' | 'userId' | 'contracts' | 'contacts' | 'notes' | 'finance'
        >
      >
    ) => Promise<Company>;
    delete: (id: string) => Promise<void>;
  };
  abstract contract: {
    findById: (id: string) => Promise<Contract | null>;
    findByCompanyId: (companyId: string) => Promise<Contract[]>;
    create: (
      contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>
    ) => Promise<Contract>;
    update: (
      id: string,
      contract: Partial<Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>>
    ) => Promise<Contract>;
    delete: (id: string) => Promise<void>;
  };
  abstract companyContact: {
    findByCompanyId: (companyId: string) => Promise<CompanyContact[]>;
    create: (
      contact: Omit<CompanyContact, 'id' | 'createdAt' | 'updatedAt'>
    ) => Promise<CompanyContact>;
    update: (
      id: string,
      contact: Partial<Omit<CompanyContact, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>>
    ) => Promise<CompanyContact>;
    delete: (id: string) => Promise<void>;
  };
  abstract companyNote: {
    findByCompanyId: (companyId: string) => Promise<CompanyNote[]>;
    create: (
      note: Omit<CompanyNote, 'id' | 'createdAt'>
    ) => Promise<CompanyNote>;
    delete: (id: string) => Promise<void>;
  };
  abstract companyFinance: {
    findByCompanyId: (companyId: string) => Promise<CompanyFinance | null>;
    create: (
      finance: {
        companyId: string;
      } &
        Partial<Omit<CompanyFinance, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>>
    ) => Promise<CompanyFinance>;
    update: (
      companyId: string,
      finance: Partial<Omit<CompanyFinance, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
      >
    ) => Promise<CompanyFinance>;
  };
  abstract checkConnection(): Promise<boolean>;

  abstract checkConfiguration(): Promise<ServiceConfigStatus>;

  /**
   * Default implementation: database services are required by default.
   * Override this method if a specific database implementation should be optional.
   */
  isRequired(): boolean {
    return true;
  }
}
