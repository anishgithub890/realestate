import nodemailer from 'nodemailer';
import { config } from '../config/env';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
      console.warn('SMTP not configured. Email sending will be disabled.');
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });

    return this.transporter;
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    const transporter = await this.getTransporter();
    if (!transporter) {
      console.log('Email not sent (SMTP not configured):', { to, subject });
      return;
    }

    try {
      await transporter.sendMail({
        from: `"${config.SMTP_FROM_NAME}" <${config.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        text: text || html.replace(/<[^>]*>/g, ''),
        html,
      });
      console.log('Email sent successfully to:', to);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.sendEmail(email, 'Password Reset Request', html);
  }

  async sendContractCreatedEmail(email: string, contractNo: string, contractType: string) {
    const html = `
      <h2>Contract Created</h2>
      <p>A new ${contractType} contract has been created with number: <strong>${contractNo}</strong></p>
      <p>Please log in to view the contract details.</p>
    `;

    await this.sendEmail(email, `New ${contractType} Contract Created`, html);
  }

  async sendPaymentReceiptEmail(email: string, receiptNo: string, amount: number) {
    const html = `
      <h2>Payment Receipt</h2>
      <p>Your payment has been received.</p>
      <p>Receipt Number: <strong>${receiptNo}</strong></p>
      <p>Amount: <strong>${amount}</strong></p>
      <p>Thank you for your payment.</p>
    `;

    await this.sendEmail(email, 'Payment Receipt', html);
  }

  async sendTicketUpdateEmail(email: string, ticketNo: string, status: string) {
    const html = `
      <h2>Ticket Update</h2>
      <p>Your maintenance ticket <strong>${ticketNo}</strong> has been updated.</p>
      <p>New Status: <strong>${status}</strong></p>
      <p>Please log in to view more details.</p>
    `;

    await this.sendEmail(email, 'Ticket Status Updated', html);
  }

  async sendLeadAssignmentEmail(email: string, leadName: string) {
    const html = `
      <h2>New Lead Assigned</h2>
      <p>A new lead has been assigned to you:</p>
      <p>Lead Name: <strong>${leadName}</strong></p>
      <p>Please log in to view the lead details and follow up.</p>
    `;

    await this.sendEmail(email, 'New Lead Assigned', html);
  }

  async sendLeadEmail(email: string, subject: string, body: string) {
    await this.sendEmail(email, subject, body);
  }
}

export default new EmailService();

