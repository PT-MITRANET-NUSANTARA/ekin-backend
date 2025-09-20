import { registerAs } from '@nestjs/config';

export interface IdAsnConfig {
  loginUrl: string;
  jwtUrl: string;
  clientId: string;
  responseType: string;
}

export default registerAs(
  'idasn',
  (): IdAsnConfig => ({
    loginUrl:
      process.env.IDASN_LOGIN_URL ||
      'https://account.idasn.pohuwatokab.go.id/oauth/authorize',
    jwtUrl:
      process.env.IDASN_JWT_URL ||
      'https://account.idasn.pohuwatokab.go.id/oauth/openid/certs',
    clientId: process.env.IDASN_CLIENT_ID || 'ekin',
    responseType: process.env.IDASN_RESPONSE_TYPE || 'token',
  }),
);
