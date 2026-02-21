import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { RedisService } from '../../../shared/redis/redis.service';
import { MailService } from '../../../shared/mail/mail.service';

const INVALID_OTP_LOCK_DURATION_SECONDS = 15 * 60; // 15 minutes
const MAX_INVALID_OTP_ATTEMPTS = 5;
const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const OTP_COOLDOWN_SECONDS = 60; // 1 minute between OTP requests
const MAX_OTP_REQUESTS = 3;
const SPAM_LOCK_DURATION_SECONDS = 3600; // 1 hour

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Check if user is restricted from requesting OTP
   */
  async checkOTPRestrictions(email: string): Promise<void> {
    // Check invalid OTP lock
    const lockStatus = await this.redisService.get(`otp_lock:${email}`);
    if (lockStatus) {
      throw new BadRequestException(
        'Account locked due to multiple failed attempts. Try again in 15 minutes.',
      );
    }

    // Check spam lock
    const spamLockStatus = await this.redisService.get(
      `otp_spam_lock_status:${email}`,
    );
    if (spamLockStatus) {
      throw new BadRequestException('Account locked due to many OTP requests.');
    }

    // Check cooldown
    const otpCooldown = await this.redisService.get(`otp_cooldown:${email}`);
    if (otpCooldown) {
      throw new BadRequestException(
        'Please wait for a minute before requesting another code.',
      );
    }
  }

  /**
   * Track OTP requests to prevent spam
   */
  async trackOTPRequests(email: string): Promise<void> {
    const otpRequests =
      (await this.redisService.get(`otp_request_count:${email}`)) || '0';

    if (Number(otpRequests) >= MAX_OTP_REQUESTS) {
      await this.redisService.set(
        `otp_spam_lock_status:${email}`,
        'true',
        'EX',
        SPAM_LOCK_DURATION_SECONDS,
      );
      throw new BadRequestException(
        'Too many OTP requests. Account locked for one hour.',
      );
    }

    // Increment request count
    await this.redisService.set(
      `otp_request_count:${email}`,
      (Number(otpRequests) + 1).toString(),
      'EX',
      3600, // 1 hour window
    );
  }

  /**
   * Generate and send OTP
   */
  async generateAndSendOTP(email: string, name: string): Promise<string> {
    const OTP = crypto.randomInt(10000, 99999).toString();

    this.logger.debug(`Generated OTP for ${email}: ${OTP}`);

    // Send OTP email
    await this.mailService.sendOTPEmail({
      name,
      email,
      OTP,
      expiry: '5 minutes',
    });

    // Store OTP in Redis
    await this.redisService.set(`otp:${email}`, OTP, 'EX', OTP_EXPIRY_SECONDS);

    // Set cooldown
    await this.redisService.set(
      `otp_cooldown:${email}`,
      'true',
      'EX',
      OTP_COOLDOWN_SECONDS,
    );

    return OTP;
  }

  /**
   * Verify OTP
   */
  async verifyOTP(email: string, OTP: string): Promise<void> {
    const storedOTP = await this.redisService.get(`otp:${email}`);

    if (!storedOTP || storedOTP !== OTP) {
      // Increment invalid attempts
      const attempts = await this.redisService.incr(
        `invalid_otp_attempts:${email}`,
      );

      if (attempts === 1) {
        await this.redisService.expire(
          `invalid_otp_attempts:${email}`,
          INVALID_OTP_LOCK_DURATION_SECONDS,
        );
      }

      // Lock account after max attempts
      if (attempts >= MAX_INVALID_OTP_ATTEMPTS) {
        await this.redisService.set(
          `otp_lock:${email}`,
          'true',
          'EX',
          INVALID_OTP_LOCK_DURATION_SECONDS,
        );
        await this.redisService.del(`invalid_otp_attempts:${email}`);
        throw new BadRequestException(
          'Account locked due to multiple failed attempts. Try again in 15 minutes.',
        );
      }

      throw new BadRequestException('Invalid or expired OTP');
    }

    // OTP is valid - clean up
    await this.redisService.del(`otp:${email}`);
    await this.redisService.del(`invalid_otp_attempts:${email}`);

    this.logger.log(`OTP verified for ${email}`);
  }
}
