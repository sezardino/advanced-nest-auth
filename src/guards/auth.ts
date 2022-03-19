import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from 'src/modules/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest() as Request;
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return false;
    }

    const token = authHeader.split(' ').pop();

    if (!token) {
      return false;
    }

    const verification = this.tokenService.validateToken(token);

    if (!verification) {
      return false;
    }

    return true;
  }
}
