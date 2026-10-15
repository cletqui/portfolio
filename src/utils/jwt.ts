import { sign, verify } from "hono/jwt";

export const signJwt = (payload: Record<string, unknown>, secret: string): Promise<string> =>
  sign(payload, secret, "HS256");

export const verifyJwt = async (token: string, secret: string): Promise<Record<string, unknown> | null> => {
  try {
    return (await verify(token, secret, "HS256")) as Record<string, unknown>;
  } catch {
    return null;
  }
};
