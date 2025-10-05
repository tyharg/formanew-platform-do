import { NotesApiClient } from './notes';

// Mock fetch globally
global.fetch = jest.fn();

describe('NotesApiClient - Pagination', () => {
  let apiClient: NotesApiClient;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    apiClient = new NotesApiClient();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getNotes pagination parameters', () => {
    it('calls API without query parameters when no pagination options provided', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes();

      expect(mockFetch).toHaveBeenCalledWith('/api/notes');
    });

    it('includes page parameter in query string', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes({ page: 2 });

      expect(mockFetch).toHaveBeenCalledWith('/api/notes?page=2');
    });

    it('includes pageSize parameter in query string', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes({ pageSize: 20 });

      expect(mockFetch).toHaveBeenCalledWith('/api/notes?pageSize=20');
    });

    it('includes search parameter in query string', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes({ search: 'meeting' });

      expect(mockFetch).toHaveBeenCalledWith('/api/notes?search=meeting');
    });

    it('includes sortBy parameter in query string', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes({ sortBy: 'oldest' });

      expect(mockFetch).toHaveBeenCalledWith('/api/notes?sortBy=oldest');
    });

    it('includes all parameters when provided', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes({
        page: 3,
        pageSize: 25,
        search: 'project',
        sortBy: 'title',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/notes?page=3&pageSize=25&search=project&sortBy=title'
      );
    });

    it('handles URL encoding for search parameters', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes({ search: 'meeting notes & project' });

      expect(mockFetch).toHaveBeenCalledWith('/api/notes?search=meeting+notes+%26+project');
    });
  });

  describe('getNotes response handling', () => {
    it('returns paginated notes response', async () => {
      const mockNotesResponse = {
        notes: [
          {
            id: '1',
            userId: 'user1',
            title: 'Test Note',
            content: 'Test Content',
            createdAt: '2025-06-01T12:00:00Z',
          },
        ],
        total: 15,
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockNotesResponse),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await apiClient.getNotes({ page: 1, pageSize: 10 });

      expect(result).toEqual(mockNotesResponse);
      expect(result.notes).toHaveLength(1);
      expect(result.total).toBe(15);
    });

    it('throws error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await expect(apiClient.getNotes({ page: 1 })).rejects.toThrow('Failed to fetch notes');
    });

    it('throws error when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(apiClient.getNotes({ page: 1 })).rejects.toThrow('Network error');
    });
  });

  describe('Edge cases', () => {
    it('handles zero page number', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes({ page: 0 });

      expect(mockFetch).toHaveBeenCalledWith('/api/notes?page=0');
    });

    it('handles negative page number', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes({ page: -1 });

      expect(mockFetch).toHaveBeenCalledWith('/api/notes?page=-1');
    });

    it('handles very large page size', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes({ pageSize: 1000 });

      expect(mockFetch).toHaveBeenCalledWith('/api/notes?pageSize=1000');
    });

    it('handles empty search string', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes({ search: '' });

      expect(mockFetch).toHaveBeenCalledWith('/api/notes?search=');
    });

    it('handles special characters in search', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);
      await apiClient.getNotes({ search: '!@#$%^&*()' });

      expect(mockFetch).toHaveBeenCalledWith('/api/notes?search=%21%40%23%24%25%5E%26*%28%29');
    });
  });

  describe('Query parameter combinations', () => {
    it('handles only page parameter', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes({ page: 5 });

      expect(mockFetch).toHaveBeenCalledWith('/api/notes?page=5');
    });

    it('handles page and pageSize only', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes({ page: 2, pageSize: 15 });

      expect(mockFetch).toHaveBeenCalledWith('/api/notes?page=2&pageSize=15');
    });

    it('handles search and sortBy only', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes({ search: 'test', sortBy: 'title' });

      expect(mockFetch).toHaveBeenCalledWith('/api/notes?search=test&sortBy=title');
    });

    it('preserves parameter order in query string', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ notes: [], total: 0 }),
      };
      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await apiClient.getNotes({
        page: 1,
        pageSize: 10,
        search: 'test',
        sortBy: 'newest',
      });

      // The order should match the order they're added in the implementation
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/notes?page=1&pageSize=10&search=test&sortBy=newest'
      );
    });
  });
});
