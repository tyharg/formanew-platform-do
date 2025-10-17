import {
  DatabaseClient,
  IncorporationCreateInput,
  IncorporationUpdateInput,
  IncorporationWithRelations,
  IncorporationMemberInput,
} from './database';
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
  FinanceLineItem,
  StoredFile,
  WorkItem,
  RelevantParty,
  BusinessAddress,
  RegisteredAgent,
  IncorporationCompanyDetails,
  IncorporationBusinessDetails,
  IncorporationPrimaryContact,
  Attestation,
} from 'types';
import { Prisma, PrismaClient } from '@prisma/client';
import { ServiceConfigStatus } from '../status/serviceConfigStatus';

const INCORPORATION_INCLUDE = {
  businessAddress: true,
  registeredAgent: true,
  businessDetails: true,
  companyDetails: true,
  attestation: true,
  primaryContact: true,
  members: {
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
} as const;

type NestedWrite<T extends { id?: string | null }> = {
  id?: string | null;
  data: Partial<Omit<T, 'id'>>;
};

const sanitizeNestedData = <T extends { id?: string | null }>(
  input?: Partial<T> | null
): NestedWrite<T> | null => {
  if (!input) {
    return null;
  }

  const { id, ...rest } = input;
  const cleaned = Object.entries(rest).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return {
    id: id ?? undefined,
    data: cleaned as Partial<Omit<T, 'id'>>,
  };
};

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

  private async findIncorporationWithRelations(
    client: PrismaClient | Prisma.TransactionClient,
    where: Prisma.IncorporationWhereUniqueInput
  ): Promise<IncorporationWithRelations | null> {
    const record = await client.incorporation.findUnique({
      where,
      include: INCORPORATION_INCLUDE,
    });

    return record as unknown as IncorporationWithRelations | null;
  }

  private async syncIncorporationMembers(
    tx: Prisma.TransactionClient,
    incorporationId: string,
    members?: IncorporationMemberInput[] | null
  ): Promise<void> {
    if (members === undefined) {
      return;
    }

    if (!members || members.length === 0) {
      await tx.incorporationMember.deleteMany({ where: { incorporationId } });
      return;
    }

    const sanitizedMembers = members
      .filter((member): member is IncorporationMemberInput => Boolean(member))
      .map((member) => {
        const { id, ...rest } = member;
        const data = Object.entries(rest).reduce<Record<string, unknown>>((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {});

        return {
          id: id ?? undefined,
          data,
        };
      })
      .filter(({ id, data }) => id || Object.keys(data).length > 0);

    const idsToKeep = sanitizedMembers
      .map((member) => member.id)
      .filter((id): id is string => Boolean(id));

    await tx.incorporationMember.deleteMany({
      where: {
        incorporationId,
        ...(idsToKeep.length > 0 ? { id: { notIn: idsToKeep } } : {}),
      },
    });

    for (const member of sanitizedMembers) {
      const { id, data } = member;
      if (id) {
        if (Object.keys(data).length === 0) {
          continue;
        }

        await tx.incorporationMember.update({
          where: { id },
          data: data as Prisma.IncorporationMemberUpdateInput,
        });
      } else if (Object.keys(data).length > 0) {
        await tx.incorporationMember.create({
          data: {
            ...(data as Prisma.IncorporationMemberUncheckedCreateInput),
            incorporationId,
          },
        });
      }
    }
  }
  file = {
    findByOwner: async (ownerType: string, ownerId: string): Promise<StoredFile[]> => {
      return prisma.file.findMany({
        where: { ownerType, ownerId },
        orderBy: { createdAt: 'desc' },
      }) as unknown as StoredFile[];
    },
    findById: async (id: string): Promise<StoredFile | null> => {
      return (await prisma.file.findUnique({ where: { id } })) as unknown as StoredFile | null;
    },
    findByContractId: async (contractId: string): Promise<StoredFile[]> => {
      return prisma.file.findMany({
        where: { contractId },
        orderBy: { createdAt: 'desc' },
      }) as unknown as StoredFile[];
    },
    create: async (
      file: Omit<StoredFile, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<StoredFile> => {
      return prisma.file.create({ data: file }) as unknown as StoredFile;
    },
    delete: async (id: string): Promise<void> => {
      await prisma.file.delete({ where: { id } });
    },
  };
  workItem = {
    findByContractId: async (contractId: string): Promise<WorkItem[]> => {
      return prisma.workItem.findMany({
        where: { contractId },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      }) as unknown as WorkItem[];
    },
    findById: async (id: string): Promise<WorkItem | null> => {
      return (await prisma.workItem.findUnique({ where: { id } })) as unknown as WorkItem | null;
    },
    create: async (
      item: Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<WorkItem> => {
      return prisma.workItem.create({ data: item }) as unknown as WorkItem;
    },
    update: async (
      id: string,
      item: Partial<Omit<WorkItem, 'id' | 'contractId' | 'createdAt' | 'updatedAt'>>
    ): Promise<WorkItem> => {
      return prisma.workItem.update({ where: { id }, data: item }) as unknown as WorkItem;
    },
    delete: async (id: string): Promise<void> => {
      await prisma.workItem.delete({ where: { id } });
    },
  };
  relevantParty = {
    findByContractId: async (contractId: string): Promise<RelevantParty[]> => {
      return prisma.relevantParty.findMany({
        where: { contractId },
        orderBy: [{ createdAt: 'asc' }],
      }) as unknown as RelevantParty[];
    },
    findById: async (id: string): Promise<RelevantParty | null> => {
      return (await prisma.relevantParty.findUnique({ where: { id } })) as unknown as RelevantParty | null;
    },
    findByEmail: async (email: string): Promise<RelevantParty[]> => {
      return prisma.relevantParty.findMany({
        where: { email: { equals: email, mode: 'insensitive' } },
        orderBy: [{ createdAt: 'desc' }],
      }) as unknown as RelevantParty[];
    },
    findByIds: async (ids: string[]): Promise<RelevantParty[]> => {
      if (ids.length === 0) {
        return [];
      }

      return prisma.relevantParty.findMany({
        where: { id: { in: ids } },
      }) as unknown as RelevantParty[];
    },
    create: async (
      party: Omit<RelevantParty, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<RelevantParty> => {
      return prisma.relevantParty.create({ data: party }) as unknown as RelevantParty;
    },
    update: async (
      id: string,
      party: Partial<Omit<RelevantParty, 'id' | 'contractId' | 'createdAt' | 'updatedAt'>>
    ): Promise<RelevantParty> => {
      return prisma.relevantParty.update({ where: { id }, data: party }) as unknown as RelevantParty;
    },
    delete: async (id: string): Promise<void> => {
      await prisma.relevantParty.delete({ where: { id } });
    },
  };
  incorporation = {
    findById: async (id: string): Promise<IncorporationWithRelations | null> => {
      return this.findIncorporationWithRelations(prisma, { id });
    },
    findByCompanyId: async (
      companyId: string
    ): Promise<IncorporationWithRelations | null> => {
      return this.findIncorporationWithRelations(prisma, { companyId });
    },
    create: async (
      incorporation: IncorporationCreateInput
    ): Promise<IncorporationWithRelations> => {
      return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const {
          businessAddress,
          registeredAgent,
          businessDetails,
          companyDetails,
          attestation,
          primaryContact,
          members,
          companyId,
          businessAddressId,
          registeredAgentId,
          businessDetailsId,
          companyDetailsId,
          attestationId,
          primaryContactId,
          businessSubType,
          nameReserved,
          llcName,
          confirmLlcName,
          consentToUseName,
          dbaDifferent,
          status,
          submittedAt,
        } = incorporation;

        let businessAddressIdToUse = businessAddressId ?? undefined;
        let registeredAgentIdToUse = registeredAgentId ?? undefined;
        let businessDetailsIdToUse = businessDetailsId ?? undefined;
        let companyDetailsIdToUse = companyDetailsId ?? undefined;
        let attestationIdToUse = attestationId ?? undefined;
        let primaryContactIdToUse = primaryContactId ?? undefined;

        const businessAddressWrite = sanitizeNestedData<BusinessAddress>(businessAddress);
        if (businessAddressWrite) {
          const targetId = businessAddressWrite.id ?? businessAddressIdToUse;
          if (targetId) {
            await tx.businessAddress.update({
              where: { id: targetId },
              data: businessAddressWrite.data as Prisma.BusinessAddressUpdateInput,
            });
            businessAddressIdToUse = targetId;
          } else {
            const createdBusinessAddress = await tx.businessAddress.create({
              data: businessAddressWrite.data as Prisma.BusinessAddressCreateInput,
            });
            businessAddressIdToUse = createdBusinessAddress.id;
          }
        }

        const registeredAgentWrite = sanitizeNestedData<RegisteredAgent>(registeredAgent);
        if (registeredAgentWrite) {
          const targetId = registeredAgentWrite.id ?? registeredAgentIdToUse;
          if (targetId) {
            await tx.registeredAgent.update({
              where: { id: targetId },
              data: registeredAgentWrite.data as Prisma.RegisteredAgentUpdateInput,
            });
            registeredAgentIdToUse = targetId;
          } else {
            const createdRegisteredAgent = await tx.registeredAgent.create({
              data: registeredAgentWrite.data as Prisma.RegisteredAgentCreateInput,
            });
            registeredAgentIdToUse = createdRegisteredAgent.id;
          }
        }

        const businessDetailsWrite =
          sanitizeNestedData<IncorporationBusinessDetails>(businessDetails);
        if (businessDetailsWrite) {
          const targetId = businessDetailsWrite.id ?? businessDetailsIdToUse;
          if (targetId) {
            await tx.incorporationBusinessDetails.update({
              where: { id: targetId },
              data: businessDetailsWrite.data as Prisma.IncorporationBusinessDetailsUpdateInput,
            });
            businessDetailsIdToUse = targetId;
          } else {
            const createdBusinessDetails = await tx.incorporationBusinessDetails.create({
              data: businessDetailsWrite.data as Prisma.IncorporationBusinessDetailsCreateInput,
            });
            businessDetailsIdToUse = createdBusinessDetails.id;
          }
        }

        const companyDetailsWrite =
          sanitizeNestedData<IncorporationCompanyDetails>(companyDetails);
        if (companyDetailsWrite) {
          const targetId = companyDetailsWrite.id ?? companyDetailsIdToUse;
          if (targetId) {
            await tx.incorporationCompanyDetails.update({
              where: { id: targetId },
              data: companyDetailsWrite.data as Prisma.IncorporationCompanyDetailsUpdateInput,
            });
            companyDetailsIdToUse = targetId;
          } else {
            const createdCompanyDetails = await tx.incorporationCompanyDetails.create({
              data: companyDetailsWrite.data as Prisma.IncorporationCompanyDetailsCreateInput,
            });
            companyDetailsIdToUse = createdCompanyDetails.id;
          }
        }

        const attestationWrite = sanitizeNestedData<Attestation>(attestation);
        if (attestationWrite) {
          const targetId = attestationWrite.id ?? attestationIdToUse;
          if (targetId) {
            await tx.attestation.update({
              where: { id: targetId },
              data: attestationWrite.data as Prisma.AttestationUpdateInput,
            });
            attestationIdToUse = targetId;
          } else {
            const createdAttestation = await tx.attestation.create({
              data: attestationWrite.data as Prisma.AttestationCreateInput,
            });
            attestationIdToUse = createdAttestation.id;
          }
        }

        const primaryContactWrite =
          sanitizeNestedData<IncorporationPrimaryContact>(primaryContact);
        if (primaryContactWrite) {
          const targetId = primaryContactWrite.id ?? primaryContactIdToUse;
          if (targetId) {
            await tx.incorporationPrimaryContact.update({
              where: { id: targetId },
              data: primaryContactWrite.data as Prisma.IncorporationPrimaryContactUpdateInput,
            });
            primaryContactIdToUse = targetId;
          } else {
            const createdPrimaryContact = await tx.incorporationPrimaryContact.create({
              data: primaryContactWrite.data as Prisma.IncorporationPrimaryContactCreateInput,
            });
            primaryContactIdToUse = createdPrimaryContact.id;
          }
        }

        const createData: Prisma.IncorporationUncheckedCreateInput = {
          companyId,
          businessSubType: businessSubType ?? null,
          nameReserved: nameReserved ?? null,
          llcName: llcName ?? null,
          confirmLlcName: confirmLlcName ?? null,
          consentToUseName: consentToUseName ?? null,
          dbaDifferent: dbaDifferent ?? null,
          businessAddressId: businessAddressIdToUse ?? null,
          registeredAgentId: registeredAgentIdToUse ?? null,
          businessDetailsId: businessDetailsIdToUse ?? null,
          companyDetailsId: companyDetailsIdToUse ?? null,
          attestationId: attestationIdToUse ?? null,
          primaryContactId: primaryContactIdToUse ?? null,
          submittedAt: submittedAt ?? null,
        };

        if (status !== undefined) {
          createData.status = status;
        }

        const created = await tx.incorporation.create({ data: createData });

        await this.syncIncorporationMembers(tx, created.id, members);

        const result = await this.findIncorporationWithRelations(tx, { id: created.id });
        if (!result) {
          throw new Error('Failed to load incorporation after creation');
        }

        return result;
      });
    },
    update: async (
      id: string,
      incorporation: IncorporationUpdateInput
    ): Promise<IncorporationWithRelations> => {
      return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const {
          businessAddress,
          registeredAgent,
          businessDetails,
          companyDetails,
          attestation,
          primaryContact,
          members,
          businessAddressId,
          registeredAgentId,
          businessDetailsId,
          companyDetailsId,
          attestationId,
          primaryContactId,
          businessSubType,
          nameReserved,
          llcName,
          confirmLlcName,
          consentToUseName,
          dbaDifferent,
          status,
          submittedAt,
        } = incorporation;

        let businessAddressIdToUse = businessAddressId ?? undefined;
        let registeredAgentIdToUse = registeredAgentId ?? undefined;
        let businessDetailsIdToUse = businessDetailsId ?? undefined;
        let companyDetailsIdToUse = companyDetailsId ?? undefined;
        let attestationIdToUse = attestationId ?? undefined;
        let primaryContactIdToUse = primaryContactId ?? undefined;

        const businessAddressWrite = sanitizeNestedData<BusinessAddress>(businessAddress);
        if (businessAddressWrite) {
          const targetId = businessAddressWrite.id ?? businessAddressIdToUse;
          if (targetId) {
            await tx.businessAddress.update({
              where: { id: targetId },
              data: businessAddressWrite.data as Prisma.BusinessAddressUpdateInput,
            });
            businessAddressIdToUse = targetId;
          } else {
            const createdBusinessAddress = await tx.businessAddress.create({
              data: businessAddressWrite.data as Prisma.BusinessAddressCreateInput,
            });
            businessAddressIdToUse = createdBusinessAddress.id;
          }
        }

        const registeredAgentWrite = sanitizeNestedData<RegisteredAgent>(registeredAgent);
        if (registeredAgentWrite) {
          const targetId = registeredAgentWrite.id ?? registeredAgentIdToUse;
          if (targetId) {
            await tx.registeredAgent.update({
              where: { id: targetId },
              data: registeredAgentWrite.data as Prisma.RegisteredAgentUpdateInput,
            });
            registeredAgentIdToUse = targetId;
          } else {
            const createdRegisteredAgent = await tx.registeredAgent.create({
              data: registeredAgentWrite.data as Prisma.RegisteredAgentCreateInput,
            });
            registeredAgentIdToUse = createdRegisteredAgent.id;
          }
        }

        const businessDetailsWrite =
          sanitizeNestedData<IncorporationBusinessDetails>(businessDetails);
        if (businessDetailsWrite) {
          const targetId = businessDetailsWrite.id ?? businessDetailsIdToUse;
          if (targetId) {
            await tx.incorporationBusinessDetails.update({
              where: { id: targetId },
              data: businessDetailsWrite.data as Prisma.IncorporationBusinessDetailsUpdateInput,
            });
            businessDetailsIdToUse = targetId;
          } else {
            const createdBusinessDetails = await tx.incorporationBusinessDetails.create({
              data: businessDetailsWrite.data as Prisma.IncorporationBusinessDetailsCreateInput,
            });
            businessDetailsIdToUse = createdBusinessDetails.id;
          }
        }

        const companyDetailsWrite =
          sanitizeNestedData<IncorporationCompanyDetails>(companyDetails);
        if (companyDetailsWrite) {
          const targetId = companyDetailsWrite.id ?? companyDetailsIdToUse;
          if (targetId) {
            await tx.incorporationCompanyDetails.update({
              where: { id: targetId },
              data: companyDetailsWrite.data as Prisma.IncorporationCompanyDetailsUpdateInput,
            });
            companyDetailsIdToUse = targetId;
          } else {
            const createdCompanyDetails = await tx.incorporationCompanyDetails.create({
              data: companyDetailsWrite.data as Prisma.IncorporationCompanyDetailsCreateInput,
            });
            companyDetailsIdToUse = createdCompanyDetails.id;
          }
        }

        const attestationWrite = sanitizeNestedData<Attestation>(attestation);
        if (attestationWrite) {
          const targetId = attestationWrite.id ?? attestationIdToUse;
          if (targetId) {
            await tx.attestation.update({
              where: { id: targetId },
              data: attestationWrite.data as Prisma.AttestationUpdateInput,
            });
            attestationIdToUse = targetId;
          } else {
            const createdAttestation = await tx.attestation.create({
              data: attestationWrite.data as Prisma.AttestationCreateInput,
            });
            attestationIdToUse = createdAttestation.id;
          }
        }

        const primaryContactWrite =
          sanitizeNestedData<IncorporationPrimaryContact>(primaryContact);
        if (primaryContactWrite) {
          const targetId = primaryContactWrite.id ?? primaryContactIdToUse;
          if (targetId) {
            await tx.incorporationPrimaryContact.update({
              where: { id: targetId },
              data: primaryContactWrite.data as Prisma.IncorporationPrimaryContactUpdateInput,
            });
            primaryContactIdToUse = targetId;
          } else {
            const createdPrimaryContact = await tx.incorporationPrimaryContact.create({
              data: primaryContactWrite.data as Prisma.IncorporationPrimaryContactCreateInput,
            });
            primaryContactIdToUse = createdPrimaryContact.id;
          }
        }

        const updateData: Prisma.IncorporationUncheckedUpdateInput = {};

        if (businessSubType !== undefined) {
          updateData.businessSubType = businessSubType;
        }
        if (nameReserved !== undefined) {
          updateData.nameReserved = nameReserved;
        }
        if (llcName !== undefined) {
          updateData.llcName = llcName;
        }
        if (confirmLlcName !== undefined) {
          updateData.confirmLlcName = confirmLlcName;
        }
        if (consentToUseName !== undefined) {
          updateData.consentToUseName = consentToUseName;
        }
        if (dbaDifferent !== undefined) {
          updateData.dbaDifferent = dbaDifferent;
        }
        if (status !== undefined) {
          updateData.status = status;
        }
        if (submittedAt !== undefined) {
          updateData.submittedAt = submittedAt ?? null;
        }
        if (businessAddressIdToUse !== undefined) {
          updateData.businessAddressId = businessAddressIdToUse ?? null;
        }
        if (registeredAgentIdToUse !== undefined) {
          updateData.registeredAgentId = registeredAgentIdToUse ?? null;
        }
        if (businessDetailsIdToUse !== undefined) {
          updateData.businessDetailsId = businessDetailsIdToUse ?? null;
        }
        if (companyDetailsIdToUse !== undefined) {
          updateData.companyDetailsId = companyDetailsIdToUse ?? null;
        }
        if (attestationIdToUse !== undefined) {
          updateData.attestationId = attestationIdToUse ?? null;
        }
        if (primaryContactIdToUse !== undefined) {
          updateData.primaryContactId = primaryContactIdToUse ?? null;
        }

        await tx.incorporation.update({
          where: { id },
          data: updateData,
        });

        await this.syncIncorporationMembers(tx, id, members);

        const result = await this.findIncorporationWithRelations(tx, { id });
        if (!result) {
          throw new Error('Failed to load incorporation after update');
        }

        return result;
      });
    },
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
      return prisma.$transaction(async (prisma) => {
        const newCompany = await prisma.company.create({
          data: company as unknown as Prisma.CompanyCreateInput,
        });

        const businessAddress = await prisma.businessAddress.create({ data: {} });
        const registeredAgent = await prisma.registeredAgent.create({ data: {} });
        const companyDetails = await prisma.incorporationCompanyDetails.create({ data: {} });
        const attestation = await prisma.attestation.create({ data: {} });

        await prisma.incorporation.create({
          data: {
            companyId: newCompany.id,
            businessAddressId: businessAddress.id,
            registeredAgentId: registeredAgent.id,
            companyDetailsId: companyDetails.id,
            attestationId: attestation.id,
          },
        });

        const created = await prisma.company.findUnique({
          where: { id: newCompany.id },
          include: {
            contracts: true,
            contacts: true,
            notes: true,
            finance: true,
            incorporation: {
              include: {
                businessAddress: true,
                registeredAgent: true,
                companyDetails: true,
                attestation: true,
              },
            },
          },
        });

        return created as unknown as Company;
      });
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
  financeLineItem = {
    findMany: async (companyId: string): Promise<FinanceLineItem[]> => {
      const records = await prisma.financeLineItem.findMany({
        where: { companyId },
        orderBy: { occurredAt: 'desc' },
      });
      return records as unknown as FinanceLineItem[];
    },
    create: async (
      companyId: string,
      lineItem: Omit<FinanceLineItem, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>
    ): Promise<FinanceLineItem> => {
      const created = await prisma.financeLineItem.create({
        data: {
          companyId,
          ...lineItem,
        },
      });
      return created as unknown as FinanceLineItem;
    },
    delete: async (companyId: string, lineItemId: string): Promise<void> => {
      await prisma.financeLineItem.deleteMany({
        where: { id: lineItemId, companyId },
      });
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
