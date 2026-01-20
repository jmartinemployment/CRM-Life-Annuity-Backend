import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  firstName: string;
  temporaryPassword?: string;
  appUrl: string;
  appName: string;
}

export default function WelcomeEmail({
  firstName,
  temporaryPassword,
  appUrl,
  appName,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {appName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{appName}</Heading>
          
          <Section style={section}>
            <Heading as="h2" style={subheading}>Welcome!</Heading>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              Your account has been created successfully. You can now access the CRM to manage your clients, policies, and activities.
            </Text>
            
            {temporaryPassword && (
              <Section style={infoBox}>
                <Text style={infoLabel}>Your temporary password:</Text>
                <Text style={passwordText}>{temporaryPassword}</Text>
                <Text style={infoSmall}>Please change this after your first login.</Text>
              </Section>
            )}
            
            <Section style={buttonContainer}>
              <Button style={button} href={`${appUrl}/login`}>
                Login to Your Account
              </Button>
            </Section>
            
            <Heading as="h3" style={sectionTitle}>Getting Started</Heading>
            <Section style={listContainer}>
              <Text style={listItem}>• Add your first client in the Parties section</Text>
              <Text style={listItem}>• Track policies and holdings</Text>
              <Text style={listItem}>• Set up activity reminders</Text>
              <Text style={listItem}>• Import existing data via ACORD XML</Text>
            </Section>
            
            <Text style={text}>
              If you have any questions, please contact your administrator.
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {appName}. All rights reserved.
            </Text>
            <Text style={footerText}>
              This is an automated message. Please do not reply directly to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '32px',
  maxWidth: '600px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
};

const heading = {
  color: '#2563eb',
  fontSize: '24px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const subheading = {
  color: '#333',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const section = {
  marginBottom: '24px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 16px',
};

const sectionTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '600',
  margin: '24px 0 12px',
};

const infoBox = {
  backgroundColor: '#dbeafe',
  border: '1px solid #3b82f6',
  borderRadius: '6px',
  padding: '16px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const infoLabel = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const passwordText = {
  backgroundColor: '#f3f4f6',
  borderRadius: '4px',
  padding: '8px 16px',
  fontFamily: 'monospace',
  fontSize: '18px',
  fontWeight: '600',
  color: '#333',
  margin: '0 0 8px',
  display: 'inline-block',
};

const infoSmall = {
  color: '#1e40af',
  fontSize: '12px',
  margin: '0',
};

const listContainer = {
  margin: '0 0 16px',
};

const listItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '1.8',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
};

const footer = {
  borderTop: '1px solid #eee',
  marginTop: '24px',
  paddingTop: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#666',
  fontSize: '12px',
  margin: '0 0 8px',
};
