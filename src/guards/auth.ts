import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { messages } from 'src/common';
import { TokenService } from 'src/modules/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest() as Request;
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED);
    }

    const token = authHeader.split(' ').pop();

    if (!token) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED);
    }

    const verification = this.tokenService.validateToken(token);

    if (!verification) {
      throw new UnauthorizedException(messages.NOT_AUTHORIZED);
    }

    return true;
  }
}
