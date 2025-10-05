import { ConfigurableService, ServiceConfigStatus } from 'services/status/serviceConfigStatus';

/**
 * Abstract class for auth service
 * Provides only methods for health check
 */
export abstract class AuthService implements ConfigurableService {
  abstract checkConnection(): Promise<boolean>;

  abstract checkConfiguration(): Promise<ServiceConfigStatus>;

  isRequired(): boolean {
    return true;
  }
}
