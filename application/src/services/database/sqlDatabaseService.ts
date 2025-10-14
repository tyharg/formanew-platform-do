import { DatabaseClient } from './database';
import { prisma } from '../../lib/prisma';
import {
  Subscription,
  Note,
  User,
  UserWithSubscriptions,
  SubscriptionStatus,
  Company,
  Contract,
  CompanyContact,
  CompanyNote,
  CompanyFinance,
} from 'types';
import { Prisma, PrismaClient } from '@prisma/client';
import { ServiceConfigStatus } from '../status/serviceConfigStatus';

/**
 * Service for interacting with the SQL database using Prisma.
 */
export class SqlDatabaseService extends DatabaseClient {
  // Service name for consistent display across all status responses
  private static readonly serviceName = 'Database (PostgreSQL)';
  private description: string =
    'The following features are impacted: overall app functionality, user, subscription and notes management';

  // Required config items with their corresponding env var names and descriptions
  private static requiredConfig = {
    databaseUrl: { envVar: 'DATABASE_URL', description: 'PostgreSQL connection string' },
  };
  private lastConnectionError: string = '';

  constructor() {
    super();
  }

  user = {
    findById: async (id: string) => {
      return prisma.user.findUnique({ where: { id } });
    },
    findByEmail: async (email: string) => {
      return prisma.user.findUnique({ where: { email } });
    },
    findByEmailAndPassword: async (email: string, passwordHash: string) => {
      return prisma.user.findFirst({ where: { email, passwordHash } });
    },
    findByVerificationToken: async (token: string) => {
      return prisma.user.findFirst({ where: { verificationToken: token } });
    },
    findAll: async (options?: {
      page?: number;
      pageSize?: number;
      searchName?: string;
      filterPlan?: string;
      filterStatus?: string;
    }): Promise<{ users: UserWithSubscriptions[]; total: number }> => {
      const page = options?.page || 1;
      const pageSize = options?.pageSize || 10;
      const skip = (page - 1) * pageSize;
      const where: Record<string, unknown> = {};
      if (options?.searchName) {
        where.name = { contains: options.searchName, mode: 'insensitive' };
      }
      if (options?.filterPlan || options?.filterStatus) {
        where.subscription = { plan: {}, status: {} };
        if (options.filterPlan) {
          (where.subscription as { plan: Record<string, unknown> }).plan = {
            equals: options.filterPlan,
          };
        }
        if (options.filterStatus) {
          (where.subscription as { status: Record<string, unknown> }).status = {
            equals: options.filterStatus,
          };
        }
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: { subscription: true },
          orderBy: { name: 'asc' },
          skip,
          take: pageSize,
        }),
        prisma.user.count({ where }),
      ]);
      return { users, total };
    },
    create: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
      const { companies: _companies, ...userData } = user;
      const newUser = await prisma.user.create({ data: userData });
      return newUser as unknown as User;
    },
    update: async (id: string, user: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> => {
      const { companies: _companies, ...userData } = user;
      return prisma.user.update({ where: { id }, data: userData }) as unknown as User;
    },
    updateByEmail: async (
      email: string,
      user: Partial<Omit<User, 'id' | 'createdAt'>>
    ): Promise<User> => {
      const { companies: _companies, ...userData } = user;
      return prisma.user.update({ where: { email }, data: userData }) as unknown as User;
    },
    delete: async (id: string): Promise<void> => {
      await prisma.user.delete({ where: { id } });
    },
    count: async (): Promise<number> => {
      return prisma.user.count();
    },
  };
  subscription = {
    findByUserAndStatus: async (
      userId: string,
      status: SubscriptionStatus
    ): Promise<Subscription | null> => {
      return prisma.subscription.findFirst({
        where: { userId, status },
      });
    },
    findById: async (id: string): Promise<Subscription | null> => {
      return prisma.subscription.findUnique({ where: { id } });
    },
    findByUserId: async (userId: string): Promise<Subscription[]> => {
      return prisma.subscription.findMany({ where: { userId } });
    },
    create: async (subscription: Omit<Subscription, 'id' | 'createdAt'>): Promise<Subscription> => {
      return prisma.subscription.create({ data: subscription });
    },
    update: async (
      userId: string,
      subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>
    ): Promise<Subscription> => {
      return prisma.subscription.update({ where: { userId }, data: subscription });
    },
    updateByCustomerId: async (
      customerId: string,
      subscription: Partial<Omit<Subscription, 'id' | 'createdAt'>>
    ): Promise<Subscription> => {
      const existing = await prisma.subscription.findFirst({ where: { customerId } });
      if (!existing) throw new Error('Subscription not found for customerId');
      return prisma.subscription.update({ where: { id: existing.id }, data: subscription });
    },
    delete: async (id: string): Promise<void> => {
      await prisma.subscription.delete({ where: { id } });
    },
  };
  note = {
    findById: async (id: string): Promise<Note | null> => {
      return prisma.note.findUnique({ where: { id } });
    },
    findByUserId: async (userId: string): Promise<Note[]> => {
      return prisma.note.findMany({ where: { userId } });
    },
    create: async (note: Omit<Note, 'id' | 'createdAt'>): Promise<Note> => {
      return prisma.note.create({ data: note });
    },
    update: async (id: string, note: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note> => {
      return prisma.note.update({ where: { id }, data: note });
    },
    delete: async (id: string): Promise<void> => {
      await prisma.note.delete({ where: { id } });
    },
    findMany: async (args: {
      userId: string;
      companyId: string;
      search?: string;
      skip: number;
      take: number;
      orderBy: {
        createdAt?: 'desc' | 'asc';
        title?: 'asc';
      };
    }) => {
      const { userId, companyId, search, skip, take, orderBy } = args;
      return prisma.note.findMany({
        where: {
          userId,
          companyId,
          ...(search
            ? {
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { content: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        skip,
        take,
        orderBy,
      });
    },
    count: async ({ userId, companyId, search }: { userId: string; companyId: string; search?: string }) => {
      return prisma.note.count({
        where: {
          userId,
          companyId,
          ...(search
            ? {
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { content: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
      });
    },
  };
  company = {
    findById: async (id: string): Promise<Company | null> => {
      const record = await prisma.company.findUnique({
        where: { id },
        include: { contracts: true, contacts: true, notes: true, finance: true },
      });
      return record as unknown as Company | null;
    },
    findByUserId: async (userId: string): Promise<Company[]> => {
      const records = await prisma.company.findMany({
        where: { userId },
        include: { contracts: true, contacts: true, notes: true, finance: true },
        orderBy: { createdAt: 'desc' },
      });
      return records as unknown as Company[];
    },
    create: async (
      company: Omit<
        Company,
        'id' | 'createdAt' | 'updatedAt' | 'contracts' | 'contacts' | 'notes' | 'finance'
      >
    ): Promise<Company> => {
      const created = await prisma.company.create({
        data: company as unknown as Prisma.CompanyCreateInput,
        include: { contracts: true, contacts: true, notes: true, finance: true },
      });
      return created as unknown as Company;
    },
    update: async (
      id: string,
      company: Partial<
        Omit<
          Company,
          'id' | 'createdAt' | 'updatedAt' | 'userId' | 'contracts' | 'contacts' | 'notes' | 'finance'
        >
      >
    ): Promise<Company> => {
      const updated = await prisma.company.update({
        where: { id },
        data: company as unknown as Prisma.CompanyUpdateInput,
        include: { contracts: true, contacts: true, notes: true, finance: true },
      });
      return updated as unknown as Company;
    },
    delete: async (id: string): Promise<void> => {
      await prisma.company.delete({ where: { id } });
    },
  };
  contract = {
    findById: async (id: string): Promise<Contract | null> => {
      const record = await prisma.contract.findUnique({
        where: { id },
      });
      return record as unknown as Contract | null;
    },
    findByCompanyId: async (companyId: string): Promise<Contract[]> => {
      const records = await prisma.contract.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
      });
      return records as unknown as Contract[];
    },
    create: async (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> => {
      const created = await prisma.contract.create({
        data: contract as unknown as Prisma.ContractCreateInput,
      });
      return created as unknown as Contract;
    },
    update: async (
      id: string,
      contract: Partial<Omit<Contract, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>>
    ): Promise<Contract> => {
      const updated = await prisma.contract.update({
        where: { id },
        data: contract as unknown as Prisma.ContractUpdateInput,
      });
      return updated as unknown as Contract;
    },
    delete: async (id: string): Promise<void> => {
      await prisma.contract.delete({ where: { id } });
    },
  };
  companyContact = {
    findByCompanyId: async (companyId: string): Promise<CompanyContact[]> => {
      const records = await prisma.companyContact.findMany({
        where: { companyId },
        orderBy: [
          { isPrimary: 'desc' },
          { fullName: 'asc' },
        ],
      });
      return records as unknown as CompanyContact[];
    },
    create: async (
      contact: Omit<CompanyContact, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<CompanyContact> => {
      const created = await prisma.companyContact.create({
        data: contact as unknown as Prisma.CompanyContactCreateInput,
      });
      return created as unknown as CompanyContact;
    },
    update: async (
      id: string,
      contact: Partial<Omit<CompanyContact, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>>
    ): Promise<CompanyContact> => {
      const updated = await prisma.companyContact.update({
        where: { id },
        data: contact as unknown as Prisma.CompanyContactUpdateInput,
      });
      return updated as unknown as CompanyContact;
    },
    delete: async (id: string): Promise<void> => {
      await prisma.companyContact.delete({ where: { id } });
    },
  };
  companyNote = {
    findByCompanyId: async (companyId: string): Promise<CompanyNote[]> => {
      const records = await prisma.companyNote.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
      });
      return records as unknown as CompanyNote[];
    },
    create: async (
      note: Omit<CompanyNote, 'id' | 'createdAt'>
    ): Promise<CompanyNote> => {
      const created = await prisma.companyNote.create({
        data: note as unknown as Prisma.CompanyNoteCreateInput,
      });
      return created as unknown as CompanyNote;
    },
    delete: async (id: string): Promise<void> => {
      await prisma.companyNote.delete({ where: { id } });
    },
  };
  companyFinance = {
    findByCompanyId: async (companyId: string): Promise<CompanyFinance | null> => {
      const record = await prisma.companyFinance.findUnique({ where: { companyId } });
      return record
        ? ({ products: [], ...record } as unknown as CompanyFinance)
        : null;
    },
    create: async (
      finance: {
        companyId: string;
      } &
        Partial<Omit<CompanyFinance, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>>
    ): Promise<CompanyFinance> => {
      const created = await prisma.companyFinance.create({
        data: finance,
      });
      return { products: [], ...created } as unknown as CompanyFinance;
    },
    update: async (
      companyId: string,
      finance: Partial<Omit<CompanyFinance, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>>
    ): Promise<CompanyFinance> => {
      const updated = await prisma.companyFinance.update({
        where: { companyId },
        data: finance,
      });
      return { products: [], ...updated } as unknown as CompanyFinance;
    },
  };
  verificationToken = {
    create: async (data: { identifier: string; token: string; expires: Date }) => {
      await prisma.verificationToken.create({ data });
    },
    find: async (identifier: string, token: string) => {
      return prisma.verificationToken.findUnique({
        where: { identifier_token: { identifier, token } },
      });
    },
    findByToken: async (token: string) => {
      return prisma.verificationToken.findFirst({ where: { token } });
    },
    delete: async (identifier: string, token: string) => {
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier, token } },
      });
    },
    deleteExpired: async (now: Date) => {
      await prisma.verificationToken.deleteMany({
        where: { expires: { lt: now } },
      });
    },
  };
  /**
   * Checks if the database service is properly configured and accessible.
   * Tests the connection by performing a simple query.
   * Creates a fresh Prisma client to test the current DATABASE_URL.
   *
   * @returns {Promise<boolean>} True if the connection is successful, false otherwise.
   */
  async checkConnection(): Promise<boolean> {
    let testClient: PrismaClient | null = null;

    try {
      // Create a fresh Prisma client to test the current DATABASE_URL
      // This ensures we're testing with the latest environment variable value
      testClient = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });

      // Test connection by performing a simple query
      await testClient.$queryRaw`SELECT 1`;
      return true;
    } catch (connectionError) {
      const errorMsg =
        connectionError instanceof Error ? connectionError.message : String(connectionError);

      console.error('Database connection test failed:', {
        error: errorMsg,
        databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      });

      this.lastConnectionError = `Connection error: ${errorMsg}`;
      return false;
    } finally {
      // Always disconnect the test client to avoid connection leaks
      if (testClient) {
        await testClient.$disconnect();
      }
    }
  }

  /**
   * Checks if the database service configuration is valid and tests connection when configuration is complete.
   */
  async checkConfiguration(): Promise<ServiceConfigStatus> {
    // Check for missing configuration
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return {
        name: SqlDatabaseService.serviceName,
        configured: false,
        connected: undefined, // Don't test connection when configuration is missing
        configToReview: ['DATABASE_URL'],
        error: 'Configuration missing',
        description: this.description,
      };
    }

    // If configured, test the connection
    const isConnected = await this.checkConnection();
    if (!isConnected) {
      return {
        name: SqlDatabaseService.serviceName,
        configured: true,
        connected: false,
        configToReview: ['DATABASE_URL'],
        error: this.lastConnectionError || 'Connection failed',
        description: this.description,
      };
    }
    return {
      name: SqlDatabaseService.serviceName,
      configured: true,
      connected: true,
    };
  }
}
