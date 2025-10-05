/* eslint-disable @typescript-eslint/no-unused-vars */
import { ServiceConfigStatus } from 'services/status/serviceConfigStatus';
import { AuthService } from './auth';

/**
 * Auth service that only performs health checks for its configuration
 */
export class NextAuthService extends AuthService {
  private static readonly serviceName = 'Auth (NextAuth)';
  private description: string =
    'The following features are impacted: signup, login, overall use of the app';

  // Required config items with their corresponding env var names and descriptions
  private static requiredConfig = {
    nextAuthUrl: { envVar: 'BASE_URL', description: 'Redirection url' },
    nextAuthSecret: { envVar: 'AUTH_SECRET', description: 'Next auth secret' },
  };
  private lastConnectionError: string = '';

  async checkConnection(): Promise<boolean> {
    return true;
  }

  async checkConfiguration(): Promise<ServiceConfigStatus> {
    const missingConfig = Object.entries(NextAuthService.requiredConfig)
      .filter(([_, value]) => !process.env[value.envVar])
      .map(([_, value]) => value.envVar);

    if (missingConfig.length > 0) {
      return {
        name: NextAuthService.serviceName,
        configured: false,
        connected: undefined, // Don't test connection when configuration is missing
        configToReview: missingConfig,
        error: 'Configuration missing',
        description: this.description,
      };
    }

    // If configured, test the connection
    const isConnected = await this.checkConnection();
    if (!isConnected) {
      return {
        name: NextAuthService.serviceName,
        configured: true,
        connected: false,
        configToReview: Object.values(NextAuthService.requiredConfig).map(
          (config) => config.envVar
        ),
        error: this.lastConnectionError || 'Connection failed',
        description: this.description,
      };
    }
    return {
      name: NextAuthService.serviceName,
      configured: true,
      connected: true,
    };
  }
}
