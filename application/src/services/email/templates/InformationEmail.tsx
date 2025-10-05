import * as React from 'react';
import { EmailLayout } from './EmailLayout';
import { Text, Section, Container } from '@react-email/components';

interface InformationEmailTemplateProps {
  title: string;
  greetingText: string;
  infoText: string;
  secondInfoText?: string;
}

/**
 * InformationEmail renders a customizable email using react-email components.
 * This template is designed to provide information to the user.
 * All text content is passed via props for reuse in multiple use cases.
 */
export const InformationEmailTemplate: React.FC<InformationEmailTemplateProps> = ({
  title,
  greetingText,
  infoText,
  secondInfoText,
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
        <Text style={{ fontSize: 14, color: '#555', margin: '32px 0 0 0', textAlign: 'center' }}>
          {infoText}
        </Text>
        {secondInfoText && <Text style={{ textAlign: 'center' }}>{secondInfoText}</Text>}
      </Section>
    </Container>
  </EmailLayout>
);
