import * as jwt from 'jsonwebtoken';

/**
 * Decode JWT token without verification
 * @param token JWT token string (with or without Bearer prefix)
 * @returns Decoded JWT payload
 */
export function decodeJwt(token: string): any {
  // Remove Bearer prefix if present
  const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

  try {
    // Decode token without verification
    return jwt.decode(tokenValue);
  } catch (error) {
    throw new Error(`Failed to decode JWT: ${error.message}`);
  }
}
