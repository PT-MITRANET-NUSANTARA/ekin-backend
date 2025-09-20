import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwksService } from './jwks.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwksService: JwksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = this.jwksService.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    try {
      const decoded = await this.jwksService.verifyToken(token);

      // Attach decoded token to request for use in controllers
      (request as any).user = decoded;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
