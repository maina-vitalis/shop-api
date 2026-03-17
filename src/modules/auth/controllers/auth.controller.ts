import {
  Controller,
  Post,
  Body,
  Param,
  Res,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services';
import {
  RegisterDto,
  VerifyOtpDto,
  LoginDto,
  ForgetPasswordDto,
  ResetPasswordDto,
} from '../dto';
import { Public } from '../decorators';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly isProduction = process.env.NODE_ENV === 'production';
  private readonly cookieSameSite = this.isProduction ? 'none' : 'lax';

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 200, description: 'OTP sent to email' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and complete registration' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);
    // Set refresh token as HTTP-only cookie
    response.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      sameSite: this.cookieSameSite,
      secure: this.isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set access_token token as HTTP-only cookie
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      sameSite: this.cookieSameSite,
      secure: this.isProduction,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return {
      status: 'success',
      message: 'Login successful',
      user: result.userWithoutPassword,
    };
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'New access token generated' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // This will be handled by the JwtRefreshStrategy
    // The refresh token is extracted from cookies in the strategy
    const cookies = request.cookies;
    const refreshToken = cookies?.['refresh_token'] as string;

    if (!refreshToken) {
      return {
        statusCode: 401,
        message: 'No refresh token provided',
      };
    }

    const result = this.authService.refreshToken(refreshToken);
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      sameSite: this.cookieSameSite,
      secure: this.isProduction,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    return {
      status: 'success',
      message: 'Login successful',
    };
  }

  @Public()
  @Post('forget-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  @Public()
  @Post('reset-password/:resetToken')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Param('resetToken') resetToken: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(resetToken, resetPasswordDto);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout(@Res({ passthrough: true }) response: Response) {
    const clearCookieOptions = {
      sameSite: this.cookieSameSite,
      secure: this.isProduction,
      path: '/',
    } as const;

    response.clearCookie('refresh_token', clearCookieOptions);
    response.clearCookie('access_token', clearCookieOptions);
    return {
      status: 'success',
      message: 'Logged out successfully',
    };
  }
}
