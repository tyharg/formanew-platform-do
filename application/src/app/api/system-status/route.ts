import { NextResponse } from 'next/server';
import { StatusService } from 'services/status/statusService';
import { HTTP_STATUS } from 'lib/api/http';

/**
 * Handles GET requests for the system status endpoint.
 * Uses cached health state for performance, with option to force fresh check.
 * This endpoint is completely service-agnostic and will work with any services
 * configured in the StatusService.
 *
 * @returns {Promise<NextResponse>} JSON response with the status of all services and system info.
 */
export const GET = async (request: Request) => {
  try {
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';

    // Ensure StatusService is initialized
    await StatusService.initialize();

    // Get health state (fresh check if requested, otherwise use cache)
    const healthState = forceRefresh
      ? await StatusService.forceHealthCheck()
      : StatusService.getHealthState();

    if (!healthState) {
      // This shouldn't happen after initialization, but handle gracefully
      console.warn('Health state is null after initialization');

      return NextResponse.json(
        {
          error: 'Health system initialization failed',
          services: [],
          systemInfo: {
            environment: process.env.NODE_ENV || 'unknown',
            timestamp: new Date().toISOString(),
          },
          status: 'error',
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    } // No need to map services - we can use them directly
    const services = healthState.services;

    // Add system information
    const systemInfo = {
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString(),
      lastHealthCheck: healthState.lastChecked.toISOString(),
    };

    return NextResponse.json(
      {
        services,
        systemInfo,
        status: healthState.isHealthy ? 'ok' : 'issues_detected',
      },
      {
        status: HTTP_STATUS.OK,
        headers: {
          'Cache-Control': forceRefresh ? 'no-store, max-age=0' : 'public, max-age=60',
        },
      }
    );
  } catch (error) {
    console.error('Error checking system status:', error);
    return NextResponse.json(
      {
        error: 'Failed to check system status',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
