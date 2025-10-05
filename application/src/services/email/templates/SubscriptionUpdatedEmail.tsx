import * as React from 'react';
import { Section, Text, Container } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

/**
 * Props for the SubscriptionUpdatedEmail component.
 */
export interface SubscriptionUpdatedEmailProps {
  plan: {
    name: string;
    description: string;
    amount: number;
    interval: string | null;
    features: string[];
    priceId: string;
  };
}

/**
 * SubscriptionUpdatedEmail React email template.
 * Renders a transactional email for notifying users about subscription plan updates.
 * Uses @react-email/components for compatibility with email clients.
 */
export function SubscriptionUpdatedEmail({ plan }: SubscriptionUpdatedEmailProps) {
  return (
    <EmailLayout title="Your subscription was updated">
      <Container
        style={{
          background: '#fff',
          borderRadius: 8,
          maxWidth: 480,
          margin: '32px auto',
          padding: 0,
        }}
      >
        <Section style={{ padding: '32px 24px' }}>
          <Text style={{ textAlign: 'center', margin: '0 0 24px 0' }}>
            Your subscription plan was updated to <b>{plan.name}</b>.
            <br />
            Thank you for using our service!
          </Text>
          <Section
            style={{
              background: '#f4f8ff',
              border: '1px solid #dbeafe',
              borderRadius: 8,
              margin: '24px 0',
              padding: 16,
            }}
          >
            <Text
              style={{ color: '#0061EB', fontWeight: 'bold', fontSize: 18, margin: '0 0 12px 0' }}
            >
              Plan Details
            </Text>
            <Text>
              <b>Name:</b> {plan.name}
            </Text>
            <Text>
              <b>Description:</b> {plan.description}
            </Text>
            <Text>
              <b>Price:</b> ${plan.amount} / {plan.interval ?? 'one-time'}
            </Text>
            <Text style={{ marginBottom: 0 }}>
              <b>Features:</b>
            </Text>
            {plan.features.map((f, i) => (
              <Text key={i} style={{ margin: '0 0 0 16px', padding: 0 }}>
                • {f}
              </Text>
            ))}
          </Section>
        </Section>
      </Container>
    </EmailLayout>
  );
}
