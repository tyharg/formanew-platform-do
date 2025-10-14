import { createDatabaseService } from 'services/database/databaseFactory';
import type { DatabaseClient } from 'services/database/database';
import type { Company } from 'types';

export const getCompanyForUser = async (
  companyId: string,
  userId: string
): Promise<{ dbClient: DatabaseClient; company: Company } | null> => {
  const dbClient = await createDatabaseService();
  const company = await dbClient.company.findById(companyId);

  if (!company || company.userId !== userId) {
    return null;
  }

  return { dbClient, company };
};
