import { Controller, Post, Get, Param, Body, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Controller, Post, Get } from '@nestjs/common';
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
  login() {}

  @Post('logout')
  logout() {}

  @Get('activate/:link')
  async activate(@Res() response: Response, @Param('link') link: string) {
    await this.authService.activation(link);
    response.redirect(this.configService.get('CLIENT_URL'));
  }

  @Get('refresh')
  refresh() {}

  @Get('users')
  getUsers() {}
}
