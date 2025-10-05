import { ConfigurableService, ServiceConfigStatus } from 'services/status/serviceConfigStatus';
import { SubscriptionPlan } from 'types';

// Billing provider types
export type BillingProvider = 'Stripe';

/**
 * Abstract base class for billing clients.
 * Provides a common interface for billing operations across different billing providers.
 */
export abstract class BillingService implements ConfigurableService {
  abstract listCustomer(email: string): Promise<{ id: string }[]>;
  abstract createCustomer(
    email: string,
    metadata?: Record<string, string>
  ): Promise<{ id: string }>;
  abstract listSubscription(
    customerId: string
  ): Promise<{ id: string; status: string; items: { id: string }[] }[]>;
  abstract createSubscription(
    customerId: string,
    plan: SubscriptionPlan
  ): Promise<{ clientSecret: string | undefined }>;
  abstract cancelSubscription(subscriptionId: string): Promise<void>;
  abstract updateSubscription(
    id: string,
    itemId: string,
    plan: SubscriptionPlan | 'GIFT'
  ): Promise<{ clientSecret: string | undefined }>;
  abstract manageSubscription(plan: SubscriptionPlan, customerId: string): Promise<string | null>;
  abstract getProducts(): Promise<
    {
      priceId: string;
      amount: number;
      interval: string | null;
      name: string;
      description: string;
      features: string[];
    }[]
  >;

  abstract checkConnection(): Promise<boolean>;

  abstract checkConfiguration(): Promise<ServiceConfigStatus>;

  isRequired(): boolean {
    return true;
  }
}
