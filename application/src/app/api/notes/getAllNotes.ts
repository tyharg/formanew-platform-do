import { HTTP_STATUS } from 'lib/api/http';
import { NextRequest, NextResponse } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';

/**
 * Fetches all notes for the authenticated user.
 * @param request - The request object with pagination
 * @param user - The user object
 * @returns A NextResponse with properly typed note data
 */
export const getAllNotes = async (
  request: NextRequest,
  user: { id: string; role: string }
): Promise<NextResponse> => {
  try {
    const userId = user.id;
    const dbClient = await createDatabaseService();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId query parameter is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const company = await dbClient.company.findById(companyId);

    if (!company || company.userId !== userId) {
      return NextResponse.json({ error: 'Company not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }

    const parsePositiveInt = (value: string | null, fallback: number, max?: number) => {
      const parsed = Number.parseInt(value ?? '', 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        return fallback;
      }
      if (max && parsed > max) {
        return max;
      }
      return parsed;
    };

    const DEFAULT_PAGE = 1;
    const DEFAULT_PAGE_SIZE = 10;
    const MAX_PAGE_SIZE = 100;

    const page = parsePositiveInt(searchParams.get('page'), DEFAULT_PAGE);
    const pageSize = parsePositiveInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const searchParam = searchParams.get('search')?.trim();
    const search = searchParam && searchParam.length > 0 ? searchParam : undefined;
    const sortByParam = searchParams.get('sortBy');
    const sortBy = sortByParam === 'oldest' || sortByParam === 'title' ? sortByParam : 'newest';
    const skip = (page - 1) * pageSize;
    const findManyParams: {
      userId: string;
      companyId: string;
      skip: number;
      take: number;
      search?: string;
      orderBy: { title: 'asc' } | { createdAt: 'asc' | 'desc' };
    } = {
      userId,
      companyId,
      skip,
      take: pageSize,
      orderBy:
        sortBy === 'title'
          ? { title: 'asc' as const }
          : sortBy === 'oldest'
            ? { createdAt: 'asc' as const }
            : { createdAt: 'desc' as const },
    };

    // Only include search if it's defined
    if (search !== undefined) {
      findManyParams.search = search;
    }

    // Get all notes for the user
    const [notes, total] = await Promise.all([
      dbClient.note.findMany(findManyParams),
      dbClient.note.count({ userId, companyId, search }),
    ]);

    // Return both notes and total count
    return NextResponse.json({ notes, total }, { status: HTTP_STATUS.OK });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
