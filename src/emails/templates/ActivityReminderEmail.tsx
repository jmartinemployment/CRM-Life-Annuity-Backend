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

interface ActivityData {
  id: string;
  subject: string;
  activityType: string;
  dueDate: string;
  dueTime?: string;
  partyName?: string;
}

interface ActivityReminderEmailProps {
  firstName: string;
  activities: ActivityData[];
  appUrl: string;
  appName: string;
}

export default function ActivityReminderEmail({
  firstName,
  activities,
  appUrl,
  appName,
}: ActivityReminderEmailProps) {
  const activityCount = activities.length;
  const activityWord = activityCount === 1 ? 'activity' : 'activities';

  return (
    <Html>
      <Head />
      <Preview>{`You have ${activityCount} upcoming ${activityWord}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{appName}</Heading>
          
          <Section style={section}>
            <Heading as="h2" style={subheading}>Activity Reminder</Heading>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              You have <strong>{activityCount}</strong> upcoming {activityWord} that {activityCount === 1 ? 'needs' : 'need'} your attention:
            </Text>
            
            <Section style={listContainer}>
              {activities.map((activity) => (
                <Section key={activity.id} style={activityItem}>
                  <Text style={activitySubject}>
                    {activity.subject || 'Untitled Activity'}
                  </Text>
                  <Text style={activityDetails}>
                    {activity.activityType} • Due: {activity.dueDate}
                    {activity.dueTime ? ` at ${activity.dueTime}` : ''}
                    {activity.partyName ? ` • Client: ${activity.partyName}` : ''}
                  </Text>
                </Section>
              ))}
            </Section>
            
            <Section style={buttonContainer}>
              <Button style={button} href={`${appUrl}/activities`}>
                View All Activities
              </Button>
            </Section>
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

const listContainer = {
  margin: '16px 0',
};

const activityItem = {
  backgroundColor: '#f9fafb',
  borderRadius: '6px',
  padding: '12px 16px',
  marginBottom: '8px',
  borderLeft: '4px solid #2563eb',
};

const activitySubject = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const activityDetails = {
  color: '#666',
  fontSize: '14px',
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
