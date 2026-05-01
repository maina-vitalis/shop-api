import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import * as path from 'node:path';
import * as fs from 'node:fs';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { EnvConfig } from '../../config/env.config';

export interface OTPEmailData {
  email: string;
  OTP: string;
  expiry?: string;
}

export interface ForgetPasswordEmailData {
  email: string;
  resetUrl: string;
  expiry: string;
}

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
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
  private renderTemplate(
    templateName: string,
    data: Record<string, any>,
  ): Promise<string> {
    const runtimePath = path.join(__dirname, 'templates', templateName);
    const sourcePath = path.join(
      process.cwd(),
      'src',
      'shared',
      'mail',
      'templates',
      templateName,
    );
    const templatePath = fs.existsSync(runtimePath) ? runtimePath : sourcePath;

    return ejs.renderFile(templatePath, data);
  }
}
