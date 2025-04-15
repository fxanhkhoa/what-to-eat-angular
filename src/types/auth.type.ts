export type ResultToken = {
  token: string;
  refreshToken: string;
};

export type JWTTokenPayload = {
  id: string;
  email: string;
  role_name: string;
  google_id: string;
};

export type RetrievedTokenFromRefreshToken = Omit<ResultToken, 'refreshToken'>;
