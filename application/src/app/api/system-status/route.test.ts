import { NextRequest } from 'next/server';
import { GET } from './route';
import { StatusService } from '../../../services/status/statusService';
import { HTTP_STATUS } from 'lib/api/http';

jest.mock('../../../services/status/statusService');

describe('System Status API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should return status of all services', async () => {
    // Arrange
    const mockHealthState = {
      services: [
        {
          name: 'DigitalOcean Spaces',
          configured: true,
          connected: true,
          error: null,
          configToReview: undefined,
        },
      ],
      isHealthy: true,
      lastChecked: new Date('2025-01-01T00:00:00.000Z'),
    };

    (StatusService.initialize as jest.Mock).mockResolvedValue(undefined);
    (StatusService.getHealthState as jest.Mock).mockReturnValue(mockHealthState);

    // Create a mock request
    const request = new NextRequest('http://localhost:3000/api/system-status');

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(HTTP_STATUS.OK);
    expect(data.services).toEqual(mockHealthState.services);
    expect(data.status).toBe('ok');
    expect(data.systemInfo).toBeDefined();
    expect(StatusService.initialize).toHaveBeenCalledTimes(1);
    expect(StatusService.getHealthState).toHaveBeenCalledTimes(1);
  });

  it('should return error when service check fails', async () => {
    // Arrange
    (StatusService.initialize as jest.Mock).mockRejectedValue(new Error('Test error'));

    // Create a mock request
    const request = new NextRequest('http://localhost:3000/api/system-status');

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(data.error).toBe('Failed to check system status');
  });
});
