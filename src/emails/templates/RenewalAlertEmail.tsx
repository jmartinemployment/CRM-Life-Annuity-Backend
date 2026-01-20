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

interface RenewalData {
  id: string;
  policyNumber: string;
  clientName: string;
  productName?: string;
  renewalDate: string;
  premiumAmount?: string;
}

interface RenewalAlertEmailProps {
  firstName: string;
  renewals: RenewalData[];
  daysUntilRenewal: number;
  appUrl: string;
  appName: string;
}

export default function RenewalAlertEmail({
  firstName,
  renewals,
  daysUntilRenewal,
  appUrl,
  appName,
}: RenewalAlertEmailProps) {
  const renewalCount = renewals.length;
  const policyWord = renewalCount === 1 ? 'policy is' : 'policies are';
  const isUrgent = daysUntilRenewal <= 7;

  return (
    <Html>
      <Head />
      <Preview>{`${renewalCount} policy ${renewalCount === 1 ? 'renewal' : 'renewals'} in ${daysUntilRenewal} days`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{appName}</Heading>
          
          <Section style={section}>
            <Heading as="h2" style={subheading}>Policy Renewal Alert</Heading>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              The following {policyWord} coming up for renewal:
            </Text>
            
            <Section style={isUrgent ? warningBox : infoBox}>
              <Text style={isUrgent ? warningText : infoText}>
                {isUrgent ? '⚠️' : '📅'} These policies renew within {daysUntilRenewal} days{isUrgent ? '!' : '.'}
              </Text>
            </Section>
            
            <Section style={listContainer}>
              {renewals.map((renewal) => (
                <Section key={renewal.id} style={renewalItem}>
                  <Text style={policyNumber}>
                    {renewal.policyNumber}
                  </Text>
                  <Text style={clientName}>
                    {renewal.clientName}
                  </Text>
                  <Text style={renewalDetails}>
                    {renewal.productName ? `${renewal.productName} • ` : ''}
                    Renewal: {renewal.renewalDate}
                    {renewal.premiumAmount ? ` • Premium: ${renewal.premiumAmount}` : ''}
                  </Text>
                </Section>
              ))}
            </Section>
            
            <Section style={buttonContainer}>
              <Button style={button} href={`${appUrl}/holdings?filter=renewals`}>
                View Renewals
              </Button>
            </Section>
            
            <Text style={text}>
              Contact your clients to discuss renewal options and ensure continuous coverage.
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

const infoBox = {
  backgroundColor: '#dbeafe',
  border: '1px solid #3b82f6',
  borderRadius: '6px',
  padding: '12px',
  margin: '16px 0',
};

const infoText = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const listContainer = {
  margin: '16px 0',
};

const renewalItem = {
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  padding: '12px 16px',
  marginBottom: '8px',
  borderLeft: '4px solid #f59e0b',
};

const policyNumber = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 2px',
};

const clientName = {
  color: '#333',
  fontSize: '14px',
  margin: '0 0 4px',
};

const renewalDetails = {
  color: '#666',
  fontSize: '13px',
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
