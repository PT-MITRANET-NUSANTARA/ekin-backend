import { registerAs } from '@nestjs/config';

export interface IdAsnConfig {
  loginUrl: string;
  jwtUrl: string;
  clientId: string;
  responseType: string;
  apiUrl: string;
  fotoUrl: string;
  endpoints: {
    [key: string]: string;
  };
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
    apiUrl:
      process.env.IDASN_API_URL ||
      'https://api.idasn.pohuwatokab.go.id/int/ekin',
    fotoUrl:
      process.env.IDASN_FOTO_URL ||
      'https://api.idasn.pohuwatokab.go.id/idasn/photos',
    endpoints: {
      userProfile: '/user/profile',
      userList: '/user/list',
      attendance: '/attendance',
      performance: '/performance',
      unorAll: '/unor/all',
      // Tambahkan endpoint lainnya sesuai kebutuhan
    },
  }),
);
