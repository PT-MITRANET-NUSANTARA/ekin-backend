import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

@Injectable()
export class JwksService {
  private client: jwksClient.JwksClient;

  constructor(private readonly configService: ConfigService) {
    const jwksUrl = this.configService.get<string>('IDASN_JWT_URL');

    if (!jwksUrl) {
      throw new Error('Missing JWKS URL configuration');
    }

    this.client = jwksClient({
      jwksUri: jwksUrl,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 10 * 60 * 1000, // 10 mins
    });
  }

  // Get signing key function to be used with jwt.verify
  private getKey = (header: any, callback: any) => {
    this.client.getSigningKey(
      header.kid,
      (err: Error | null, key?: jwksClient.SigningKey) => {
        if (err) {
          console.log('Error getting signing key:', err);
          return callback(err);
        }

        if (!key) {
          console.log('No signing key found');
          return callback(new Error('Invalid token'), null);
        }

        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      },
    );
  };

  // Verify the JWT token using callback approach
  async verifyToken(token: string): Promise<any> {
    try {
      return await new Promise((resolve, reject) => {
        jwt.verify(
          token,
          this.getKey,
          { algorithms: ['RS256'] },
          (err, decoded) => {
            if (err) {
              console.log('Token verification error:', err.message);
              return reject(err);
            }
            resolve(decoded);
          },
        );
      });
    } catch (error) {
      throw new UnauthorizedException(
        `Token verification failed: ${error.message}`,
      );
    }
  }

  // Extract token from Authorization header
  extractTokenFromHeader(header: string): string | undefined {
    if (!header) return undefined;

    const [type, token] = header.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
