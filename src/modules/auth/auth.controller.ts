import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login';
import { RegistrationDto } from './dto/registration';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('registration')
  async registration(@Body() dto: RegistrationDto, @Res() response: Response) {
    const userData = await this.authService.registration(dto);

    response.cookie('refreshToken', 1, {
      maxAge: 30 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return userData;
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() response: Response) {
    await this.authService.login(dto);

    response.cookie('refreshToken', 1, {
      maxAge: 30 * 60 * 60 * 1000,
      httpOnly: true,
    });
  }

  @Get('logout')
  async logout(@Req() request: Request, @Res() response: Response) {
    const { refreshToken } = request.cookies;

    if (!refreshToken) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED);
    }

    await this.authService.logout(refreshToken);
    response.clearCookie(refreshToken);
  }

  @Get('activate/:link')
  async activate(@Res() response: Response, @Param('link') link: string) {
    await this.authService.activation(link);
    response.redirect(this.configService.get('CLIENT_URL'));
  }

  @Get('refresh')
  refresh() {}

  @Get('users')
  getUsers() {
    return [1, 2];
  }
}
