import { Controller, Post, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor() {}

  @Post('registration')
  registration() {}

  @Post('login')
  login() {}

  @Post('logout')
  logout() {}

  @Get('activate/:link')
  activate() {}

  @Get('refresh')
  refresh() {}

  @Get('users')
  getUsers() {}
}
