import { Resend } from 'resend';
import { render } from '@react-email/render';
import PasswordResetEmail from './templates/PasswordResetEmail';
import ActivityReminderEmail from './templates/ActivityReminderEmail';
import RenewalAlertEmail from './templates/RenewalAlertEmail';
import WelcomeEmail from './templates/WelcomeEmail';

// Initialize Resend client
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

// Configuration helpers
const getFromEmail = () => process.env.EMAIL_FROM || 'noreply@example.com';
const getAppName = () => process.env.APP_NAME || 'ACORD CRM';
const getAppUrl = () => process.env.APP_URL || 'http://localhost:4200';

// =============================================================================
// PASSWORD RESET EMAIL
// =============================================================================

export interface PasswordResetEmailData {
  email: string;
  firstName: string;
  resetToken: string;
  expiresInMinutes?: number;
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<{ success: boolean; id?: string; error?: string }> {
  const { email, firstName, resetToken, expiresInMinutes = 60 } = data;
  const appUrl = getAppUrl();
  const appName = getAppName();
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

  try {
    const emailHtml = await render(
      PasswordResetEmail({
        firstName,
        resetUrl,
        expiresInMinutes,
        appName,
      })
    );

    const plainText = generatePasswordResetPlainText(firstName, resetUrl, expiresInMinutes, appName);

    const client = getResendClient();
    const result = await client.emails.send({
      from: getFromEmail(),
      to: email,
      subject: `Reset Your ${appName} Password`,
      html: emailHtml,
      text: plainText,
    });

    if (result.error) {
      console.error('Failed to send password reset email:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log('📧 Password reset email sent:', result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function generatePasswordResetPlainText(firstName: string, resetUrl: string, expiresInMinutes: number, appName: string): string {
  return `
Hi ${firstName},

We received a request to reset your password for your ${appName} account.

Reset your password by visiting this link:
${resetUrl}

This link expires in ${expiresInMinutes} minutes.

If you didn't request this password reset, you can safely ignore this email.

- The ${appName} Team
  `.trim();
}

// =============================================================================
// ACTIVITY REMINDER EMAIL
// =============================================================================

export interface ActivityData {
  id: string;
  subject: string;
  activityType: string;
  dueDate: string;
  dueTime?: string;
  partyName?: string;
}

export interface ActivityReminderEmailData {
  email: string;
  firstName: string;
  activities: ActivityData[];
}

export async function sendActivityReminderEmail(data: ActivityReminderEmailData): Promise<{ success: boolean; id?: string; error?: string }> {
  const { email, firstName, activities } = data;
  const appUrl = getAppUrl();
  const appName = getAppName();

  try {
    const emailHtml = await render(
      ActivityReminderEmail({
        firstName,
        activities,
        appUrl,
        appName,
      })
    );

    const plainText = generateActivityReminderPlainText(firstName, activities, appUrl, appName);

    const client = getResendClient();
    const result = await client.emails.send({
      from: getFromEmail(),
      to: email,
      subject: `Reminder: ${activities.length} Upcoming ${activities.length === 1 ? 'Activity' : 'Activities'}`,
      html: emailHtml,
      text: plainText,
    });

    if (result.error) {
      console.error('Failed to send activity reminder email:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log('📧 Activity reminder email sent:', result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Error sending activity reminder email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function generateActivityReminderPlainText(firstName: string, activities: ActivityData[], appUrl: string, appName: string): string {
  const activityList = activities
    .map(a => `- ${a.subject || 'Untitled Activity'} (${a.activityType}) - Due: ${a.dueDate}${a.dueTime ? ` at ${a.dueTime}` : ''}${a.partyName ? ` - Client: ${a.partyName}` : ''}`)
    .join('\n');

  return `
Hi ${firstName},

You have ${activities.length} upcoming ${activities.length === 1 ? 'activity' : 'activities'}:

${activityList}

View your activities at: ${appUrl}/activities

- The ${appName} Team
  `.trim();
}

// =============================================================================
// POLICY RENEWAL ALERT EMAIL
// =============================================================================

export interface RenewalData {
  id: string;
  policyNumber: string;
  clientName: string;
  productName?: string;
  renewalDate: string;
  premiumAmount?: string;
}

export interface RenewalAlertEmailData {
  email: string;
  firstName: string;
  renewals: RenewalData[];
  daysUntilRenewal: number;
}

export async function sendRenewalAlertEmail(data: RenewalAlertEmailData): Promise<{ success: boolean; id?: string; error?: string }> {
  const { email, firstName, renewals, daysUntilRenewal } = data;
  const appUrl = getAppUrl();
  const appName = getAppName();

  try {
    const emailHtml = await render(
      RenewalAlertEmail({
        firstName,
        renewals,
        daysUntilRenewal,
        appUrl,
        appName,
      })
    );

    const plainText = generateRenewalAlertPlainText(firstName, renewals, daysUntilRenewal, appUrl, appName);

    const client = getResendClient();
    const result = await client.emails.send({
      from: getFromEmail(),
      to: email,
      subject: `🔔 ${renewals.length} Policy ${renewals.length === 1 ? 'Renewal' : 'Renewals'} in ${daysUntilRenewal} Days`,
      html: emailHtml,
      text: plainText,
    });

    if (result.error) {
      console.error('Failed to send renewal alert email:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log('📧 Renewal alert email sent:', result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Error sending renewal alert email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function generateRenewalAlertPlainText(firstName: string, renewals: RenewalData[], daysUntilRenewal: number, appUrl: string, appName: string): string {
  const renewalList = renewals
    .map(r => `- ${r.policyNumber} - ${r.clientName} - Renews: ${r.renewalDate}${r.premiumAmount ? ` - Premium: ${r.premiumAmount}` : ''}`)
    .join('\n');

  return `
Hi ${firstName},

Policy Renewal Alert - ${renewals.length} ${renewals.length === 1 ? 'policy' : 'policies'} renewing within ${daysUntilRenewal} days:

${renewalList}

View renewals at: ${appUrl}/holdings?filter=renewals

- The ${appName} Team
  `.trim();
}

// =============================================================================
// WELCOME EMAIL
// =============================================================================

export interface WelcomeEmailData {
  email: string;
  firstName: string;
  temporaryPassword?: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; id?: string; error?: string }> {
  const { email, firstName, temporaryPassword } = data;
  const appUrl = getAppUrl();
  const appName = getAppName();

  try {
    const emailHtml = await render(
      WelcomeEmail({
        firstName,
        temporaryPassword,
        appUrl,
        appName,
      })
    );

    const plainText = generateWelcomePlainText(firstName, temporaryPassword, appUrl, appName);

    const client = getResendClient();
    const result = await client.emails.send({
      from: getFromEmail(),
      to: email,
      subject: `Welcome to ${appName}!`,
      html: emailHtml,
      text: plainText,
    });

    if (result.error) {
      console.error('Failed to send welcome email:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log('📧 Welcome email sent:', result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function generateWelcomePlainText(firstName: string, temporaryPassword: string | undefined, appUrl: string, appName: string): string {
  return `
Hi ${firstName},

Welcome to ${appName}!

Your account has been created successfully.
${temporaryPassword ? `\nYour temporary password: ${temporaryPassword}\nPlease change this after your first login.\n` : ''}
Login at: ${appUrl}/login

Getting Started:
- Add your first client in the Parties section
- Track policies and holdings
- Set up activity reminders
- Import existing data via ACORD XML

- The ${appName} Team
  `.trim();
}

// =============================================================================
// TEST EMAIL
// =============================================================================

export async function sendTestEmail(toEmail: string): Promise<{ success: boolean; id?: string; error?: string }> {
  const appName = getAppName();
  const fromEmail = getFromEmail();

  try {
    const client = getResendClient();
    const result = await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `[TEST] ${appName} Email Configuration`,
      html: `<h1>Test Email</h1><p>Your email configuration is working correctly!</p><p>From: ${fromEmail}</p><p>Sent at: ${new Date().toISOString()}</p>`,
      text: `Test email from ${appName}. From: ${fromEmail}. Sent at: ${new Date().toISOString()}`,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    console.log('📧 Test email sent:', result.data?.id);
    return { success: true, id: result.data?.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
