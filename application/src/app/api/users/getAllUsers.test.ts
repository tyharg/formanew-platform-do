import { HTTP_STATUS } from 'lib/api/http';
import { getAllUsers } from './getAllUsers';
import { NextRequest } from 'next/server';
import { createDatabaseService } from 'services/database/databaseFactory';

jest.mock('services/database/databaseFactory', () => ({
  createDatabaseService: jest.fn(),
}));

type MockDbClient = {
  user: {
    findAll: jest.Mock;
  };
};

describe('getAllUsers', () => {
  let mockDbClient: MockDbClient;

  beforeEach(() => {
    mockDbClient = {
      user: {
        findAll: jest.fn(),
      },
    };
    (createDatabaseService as jest.Mock).mockResolvedValue(mockDbClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function makeRequest(url: string) {
    return { url } as unknown as NextRequest;
  }

  it('returns users and total count (no filters)', async () => {
    const users = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
    ];
    mockDbClient.user.findAll.mockResolvedValue({ users, total: 2 });
    const req = makeRequest('http://localhost/api/users');
    const res = await getAllUsers(req);
    const json = await res.json();
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(json).toEqual({ users, total: 2 });
    expect(mockDbClient.user.findAll).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      searchName: undefined,
      filterPlan: undefined,
      filterStatus: undefined,
    });
  });

  it('applies pagination and filters', async () => {
    mockDbClient.user.findAll.mockResolvedValue({ users: [], total: 0 });
    const req = makeRequest(
      'http://localhost/api/users?page=2&pageSize=5&searchName=foo&filterPlan=pro&filterStatus=active'
    );
    await getAllUsers(req);
    expect(mockDbClient.user.findAll).toHaveBeenCalledWith({
      page: 2,
      pageSize: 5,
      searchName: 'foo',
      filterPlan: 'pro',
      filterStatus: 'active',
    });
  });

  it('handles invalid page/pageSize gracefully', async () => {
    mockDbClient.user.findAll.mockResolvedValue({ users: [], total: 0 });
    const req = makeRequest('http://localhost/api/users?page=notanumber&pageSize=notanumber');
    await getAllUsers(req);
    expect(mockDbClient.user.findAll).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      searchName: undefined,
      filterPlan: undefined,
      filterStatus: undefined,
    });
  });

  it('returns 500 on database error', async () => {
    mockDbClient.user.findAll.mockRejectedValue(new Error('DB fail'));
    const req = makeRequest('http://localhost/api/users');
    const res = await getAllUsers(req);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    const json = await res.json();
    expect(json).toEqual({ error: 'Internal server error' });
  });
});
