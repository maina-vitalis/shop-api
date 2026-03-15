import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../../shared/mail';
import { OtpService } from './otp.service';
import { TokenService } from './token.service';
import {
  RegisterDto,
  VerifyOtpDto,
  LoginDto,
  ForgetPasswordDto,
  ResetPasswordDto,
} from '../dto';
import { RedisService } from '../../../shared/redis';
import { ConfigService } from '@nestjs/config';
import z from 'zod';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user - sends OTP for verification
   */
  async register(registerDto: RegisterDto) {
    const { name, email, password, confirmPassword } = registerDto;

    // Validate passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException("Passwords don't match");
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists with this email maina');
    }

    // Check OTP restrictions (rate limiting, locks, etc.)
    await this.otpService.checkOTPRestrictions(email);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user data object
    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    // Track OTP requests and send OTP
    await this.otpService.trackOTPRequests(email);
    await this.otpService.generateAndSendOTP(email);

    // Save user data temporarily in Redis
    await this.redisService.set(
      `user_data:${email}`,
      JSON.stringify(userData),
      'EX',
      300, // 5 minutes
    );

    this.logger.log(`OTP sent to ${email}`);

    return {
      status: 'success',
      message: 'OTP sent to email. Please verify to complete registration.',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const UserDataSchema = z.object({
      name: z.string(),
      email: z.email(),
      password: z.string().optional(),
    });

    type UserDataType = z.infer<typeof UserDataSchema>;
    const { email, OTP } = verifyOtpDto;

    // Verify OTP
    await this.otpService.verifyOTP(email, OTP);

    // Get user data from Redis
    const userDataStr: string | null = await this.redisService.get(
      `user_data:${email}`,
    );

    if (!userDataStr) {
      throw new BadRequestException(
        'Registration expired. Please register again.',
      );
    }

    const parsed: unknown = JSON.parse(userDataStr);
    const userData: UserDataType = UserDataSchema.parse(parsed);
    // Create user in database
    await this.prisma.user.create({
      data: userData,
    });

    // Clean up Redis
    await this.redisService.del(`user_data:${email}`);

    this.logger.log(`User ${email} registered successfully`);

    return {
      status: 'success',
      message: 'OTP verified successfully. Registration complete.',
    };
  }

  async login(loginDto: LoginDto) {
    const LoginSchema = z.object({
      email: z.email('Please provide an email'),
      password: z.string('Password is required'),
    });

    const { email, password } = LoginSchema.parse(loginDto);

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user?.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken(
      user.id,
      user.role,
    );
    const refreshToken = this.tokenService.generateRefreshToken(user.id);

    this.logger.log(`User ${email} logged in successfully`);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  refreshToken(refreshToken: string) {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.tokenService.generateAccessToken(
      payload.userId,
      payload.role,
    );

    return { accessToken };
  }

  /**
   * Request password reset
   */
  async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    const { email } = forgetPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return {
        status: 'success',
        message:
          'If an account exists with this email, a reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Store in Redis with 1 hour expiry
    await this.redisService.set(
      `reset:${hashedToken}`,
      user.id.toString(),
      'EX',
      3600,
    );

    // Generate reset URL
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Send email
    await this.mailService.sendForgetPasswordEmail({
      email: user.email,
      resetUrl,
      expiry: '1 hour',
    });

    this.logger.log(`Password reset email sent to ${email}`);

    return {
      status: 'success',
      message:
        'If an account exists with this email, a reset link has been sent.',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetToken: string, resetPasswordDto: ResetPasswordDto) {
    const { newPassword } = resetPasswordDto;

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Get user ID from Redis
    const userId = await this.redisService.get(`reset:${hashedToken}`);

    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Delete reset token from Redis
    await this.redisService.del(`reset:${hashedToken}`);

    // Generate new access token for automatic login
    const accessToken = this.tokenService.generateAccessToken(
      user.id,
      user.role,
    );

    this.logger.log(`Password reset successful for user ${userId}`);

    return {
      status: 'success',
      message: 'Password reset successful',
      accessToken,
    };
  }
}
