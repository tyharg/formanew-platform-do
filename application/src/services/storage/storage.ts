import { ServiceConfigStatus, ConfigurableService } from '../status/serviceConfigStatus';

/**
 * Abstract base class for all storage providers.
 * Provides a common interface for file storage operations across different storage services.
 */
export abstract class StorageService implements ConfigurableService {
  abstract uploadFile(
    userId: string,
    fileName: string,
    file: File,
    options?: { ACL?: 'public-read' | 'private' }
  ): Promise<string>;

  abstract getFileUrl(userId: string, fileName: string, expiresIn?: number): Promise<string>;

  abstract deleteFile(userId: string, fileName: string): Promise<void>;

  abstract checkConnection(): Promise<boolean>;

  abstract checkConfiguration(): Promise<ServiceConfigStatus>;

  /**
   * Default implementation: storage services are optional by default.
   * Override this method if a specific storage implementation should be required.
   */
  isRequired(): boolean {
    return false;
  }
}
