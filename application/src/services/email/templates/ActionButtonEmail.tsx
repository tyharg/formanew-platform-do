import * as React from 'react';
import { EmailLayout } from './EmailLayout';
import { Button, Text, Section, Container, Link } from '@react-email/components';

interface ActionButtonEmailTemplateProps {
  title: string;
  buttonUrl: string;
  buttonText: string;
  greetingText: string;
  infoText?: string;
  fallbackText: string;
  fallbackUrlLabel: string;
}

/**
 * ActionButtonEmailTemplate renders a customizable email using react-email components.
 * This template is designed to include a prominent action button that directs users to a specified URL.
 * All text content is passed via props for reuse in multiple use cases.
 */
export const ActionButtonEmailTemplate: React.FC<ActionButtonEmailTemplateProps> = ({
  title,
  buttonUrl,
  buttonText,
  greetingText,
  infoText,
  fallbackText,
  fallbackUrlLabel,
}) => (
  <EmailLayout title={title}>
    <Container
      style={{
        background: '#fff',
        borderRadius: '8px',
        maxWidth: 480,
        margin: '32px auto',
        padding: 0,
        textAlign: 'center',
      }}
    >
      <Section style={{ textAlign: 'center' }}>
        <Text style={{ textAlign: 'center' }}>{greetingText}</Text>
        <Button
          href={buttonUrl}
          style={{
            background: '#0070f3',
            color: '#fff',
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: 'bold',
            margin: '20px 0',
            display: 'inline-block',
            textAlign: 'center',
          }}
        >
          {buttonText}
        </Button>
        {infoText && <Text style={{ textAlign: 'center' }}>{infoText}</Text>}
        <Text style={{ fontSize: 14, color: '#555', margin: '32px 0 0 0', textAlign: 'center' }}>
          {fallbackText}
        </Text>
        <Text
          style={{
            wordBreak: 'break-all',
            color: '#0070f3',
            fontSize: 14,
            textAlign: 'center',
            paddingTop: 0,
            marginTop: 0,
          }}
        >
          <Link href={buttonUrl}>{fallbackUrlLabel}</Link>
        </Text>
      </Section>
    </Container>
  </EmailLayout>
);
