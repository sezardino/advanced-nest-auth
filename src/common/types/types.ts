export interface TokenPayload {
  userId: string;
  refreshToken: string;
  email: string;
  iat: number;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
