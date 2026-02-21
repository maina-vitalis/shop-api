import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import * as path from 'node:path';

export interface OTPEmailData {
  name: string;
  email: string;
  OTP: string;
  expiry?: string;
}

export interface ForgetPasswordEmailData {
  name: string;
  email: string;
  resetUrl: string;
  expiry: string;
}

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });

    this.fromEmail =
      this.configService.get<string>('SMTP_FROM') ||
      '"Tech Corp" <noreply@techcorp.com>';
  }

  /**
   * Send OTP verification email
   */
  async sendOTPEmail(data: OTPEmailData): Promise<void> {
    try {
      const html = await this.renderTemplate('otp-email.template.ejs', {
        ...data,
        expiry: data.expiry || '5 minutes',
      });

      const info = await this.transporter.sendMail({
        html,
        to: data.email,
        from: this.fromEmail,
        subject: 'Please complete your registration',
      });

      this.logger.log(`OTP email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Failed to send OTP email', error);
      throw new Error('Failed to send OTP email');
    }
  }

  /**
   * Send password reset email
   */
  async sendForgetPasswordEmail(data: ForgetPasswordEmailData): Promise<void> {
    try {
      const html = await this.renderTemplate(
        'forget-password.template.ejs',
        data,
      );

      const info = await this.transporter.sendMail({
        html,
        to: data.email,
        from: this.fromEmail,
        subject: 'Reset your password',
      });

      this.logger.log(`Password reset email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Render an EJS template
   */
  private async renderTemplate(
    templateName: string,
    data: Record<string, any>,
  ): Promise<string> {
    const templatePath = path.join(__dirname, 'templates', templateName);
    return ejs.renderFile(templatePath, data);
  }
}
