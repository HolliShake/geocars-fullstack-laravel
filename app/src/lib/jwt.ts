/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from 'jwt-decode';

type JwtKey = 'aud' | 'jti' | 'iat' | 'nbf' | 'exp' | 'sub' | 'scopes';

export default function getJwtContent(token: string, key: JwtKey): string | number | any[] {
  if (!token) return '';
  const decoded = jwtDecode(token) as any;
  return decoded[key];
}
