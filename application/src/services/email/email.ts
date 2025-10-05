import { ServiceConfigStatus, ConfigurableService } from '../status/serviceConfigStatus';

/**
 * Email attachment interface for local (in-memory) file attachments.
 * This implementation uses the local attachment approach where file content 
 * is sent directly as Buffer objects, not remote URLs.
 * 
 * @property filename - Name of the file as it will appear in the email
 * @property content - In-memory file content as Buffer (local attachment)
 * @property contentType - MIME type of the attachment (e.g., 'application/pdf')
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

/**
 * Abstract base class for all email providers.
 * Provides a common interface for email operations across different email services.
 */
export abstract class EmailService implements ConfigurableService {
  abstract sendReactEmail(
    to: string,
    subject: string,
    contentComponent: React.ReactNode,
    attachments?: EmailAttachment[]
  ): Promise<void>;

  abstract checkConnection(): Promise<boolean>;

  abstract checkConfiguration(): Promise<ServiceConfigStatus>;

  abstract isEmailEnabled(): boolean;

  isRequired(): boolean {
    return true;
  }
}
