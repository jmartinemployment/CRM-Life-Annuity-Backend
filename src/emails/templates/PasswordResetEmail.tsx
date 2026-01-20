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

interface PasswordResetEmailProps {
  firstName: string;
  resetUrl: string;
  expiresInMinutes: number;
  appName: string;
}

export default function PasswordResetEmail({
  firstName,
  resetUrl,
  expiresInMinutes,
  appName,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your {appName} password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{appName}</Heading>
          
          <Section style={section}>
            <Heading as="h2" style={subheading}>Password Reset Request</Heading>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              We received a request to reset your password. Click the button below to create a new password:
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>
            
            <Section style={warningBox}>
              <Text style={warningText}>
                ⏰ This link expires in {expiresInMinutes} minutes.
              </Text>
            </Section>
            
            <Text style={text}>
              If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
            </Text>
            
            <Text style={smallText}>
              If the button doesn't work, copy and paste this link into your browser:
              <br />
              <a href={resetUrl} style={link}>{resetUrl}</a>
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

const smallText = {
  color: '#666',
  fontSize: '12px',
  lineHeight: '1.6',
  marginTop: '24px',
};

const link = {
  color: '#2563eb',
  wordBreak: 'break-all' as const,
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

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
  padding: '12px',
  margin: '16px 0',
};

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
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
