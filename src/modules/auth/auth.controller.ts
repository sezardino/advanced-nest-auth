import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/guards';
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
    const token = await this.authService.login(dto);

    response.cookie('refreshToken', 1, {
      maxAge: 30 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return { token };
  }

  @Get('logout')
  async logout(@Req() request: Request, @Res() response: Response) {
    const { refreshToken } = request.cookies;

    await this.authService.logout(refreshToken);
    response.clearCookie(refreshToken);
  }

  @Get('activate/:link')
  async activate(@Res() response: Response, @Param('link') link: string) {
    await this.authService.activation(link);
    response.redirect(this.configService.get('CLIENT_URL'));
  }

  @Get('refresh')
  async refresh(@Req() request: Request) {
    const { refreshToken } = request.cookies;

    await this.authService.refresh(refreshToken);
  }

  @UseGuards(AuthGuard)
  @Get('users')
  async getUsers() {
    return await this.authService.getUsers();
  }
}
