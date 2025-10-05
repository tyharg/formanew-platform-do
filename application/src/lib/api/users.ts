/**
 * API client for interacting with user-related endpoints.
 */
export class UsersClient {
  constructor(private baseURL = '/api') {}

  // Fetch all users (GET /api/users)
  async getUsers(params?: {
    page?: number;
    pageSize?: number;
    searchName?: string;
    filterPlan?: string;
    filterStatus?: string;
  }) {
    const url = new URL(this.baseURL + '/users', window.location.origin);
    if (params) {
      if (params.page) url.searchParams.set('page', String(params.page));
      if (params.pageSize) url.searchParams.set('pageSize', String(params.pageSize));
      if (params.searchName) url.searchParams.set('searchName', params.searchName);
      if (params.filterPlan) url.searchParams.set('filterPlan', params.filterPlan);
      if (params.filterStatus) url.searchParams.set('filterStatus', params.filterStatus);
    }
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  }

  // Update a user (PATCH /api/users)
  async updateUser(id: string, updateData: Partial<{ name: string; email: string; role: string }>) {
    const res = await fetch(this.baseURL + `/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updateData }),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  }
}
