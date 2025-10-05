import { InvoiceService } from './invoiceService';
import { serverConfig } from '../../settings';

// Invoice provider types
export type InvoiceProvider = 'DigitalOcean GenAI';

/**
 * Factory function to create and return the appropriate invoice service based on configuration.
 * Uses dynamic imports to avoid circular dependencies.
 */
export async function createInvoiceService(): Promise<InvoiceService> {
  const invoiceProvider = serverConfig.invoiceProvider || 'DigitalOcean GenAI';

  switch (invoiceProvider) {
    case 'DigitalOcean GenAI':
    default: {
      return new InvoiceService();
    }
    // Add more providers here in the future if needed
  }
} 