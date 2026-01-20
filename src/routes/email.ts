import { Router, Request, Response } from 'express';
import {
  sendPasswordResetEmail,
  sendActivityReminderEmail,
  sendRenewalAlertEmail,
  sendWelcomeEmail,
  sendTestEmail,
} from '../emails/emailService';

const router = Router();

// POST /api/email/test - Send a test email (ADMIN only)
router.post('/test', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, error: 'Email address is required' });
      return;
    }

    const result = await sendTestEmail(email);

    if (result.success) {
      res.json({ success: true, message: 'Test email sent successfully', id: result.id });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/email/password-reset - Send password reset email
router.post('/password-reset', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstName, resetToken, expiresInMinutes } = req.body;

    if (!email || !firstName || !resetToken) {
      res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: email, firstName, resetToken' 
      });
      return;
    }

    const result = await sendPasswordResetEmail({
      email,
      firstName,
      resetToken,
      expiresInMinutes,
    });

    if (result.success) {
      res.json({ success: true, message: 'Password reset email sent', id: result.id });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send password reset email',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/email/activity-reminder - Send activity reminder email
router.post('/activity-reminder', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstName, activities } = req.body;

    if (!email || !firstName || !activities || !Array.isArray(activities)) {
      res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: email, firstName, activities (array)' 
      });
      return;
    }

    const result = await sendActivityReminderEmail({
      email,
      firstName,
      activities,
    });

    if (result.success) {
      res.json({ success: true, message: 'Activity reminder email sent', id: result.id });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error sending activity reminder email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send activity reminder email',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/email/renewal-alert - Send renewal alert email
router.post('/renewal-alert', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstName, renewals, daysUntilRenewal } = req.body;

    if (!email || !firstName || !renewals || !Array.isArray(renewals) || daysUntilRenewal === undefined) {
      res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: email, firstName, renewals (array), daysUntilRenewal' 
      });
      return;
    }

    const result = await sendRenewalAlertEmail({
      email,
      firstName,
      renewals,
      daysUntilRenewal,
    });

    if (result.success) {
      res.json({ success: true, message: 'Renewal alert email sent', id: result.id });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error sending renewal alert email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send renewal alert email',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /api/email/welcome - Send welcome email
router.post('/welcome', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, firstName, temporaryPassword } = req.body;

    if (!email || !firstName) {
      res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: email, firstName' 
      });
      return;
    }

    const result = await sendWelcomeEmail({
      email,
      firstName,
      temporaryPassword,
    });

    if (result.success) {
      res.json({ success: true, message: 'Welcome email sent', id: result.id });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send welcome email',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/email/config - Get email configuration (without secrets)
router.get('/config', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: {
      configured: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.EMAIL_FROM || 'not set',
      appName: process.env.APP_NAME || 'ACORD CRM',
      appUrl: process.env.APP_URL || 'http://localhost:4200',
    },
  });
});

export default router;
