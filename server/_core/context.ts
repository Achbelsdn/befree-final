import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { parse as parseCookieHeader } from "cookie";
import { jwtVerify } from "jose";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// Test accounts for demo purposes
const TEST_ACCOUNTS: Record<string, Partial<User>> = {
  'test-user-openid': {
    id: 1,
    openId: 'test-user-openid',
    name: 'Compte Test',
    email: 'test@beninfreelance.com',
    userType: 'client',
    isSeller: false,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    kycStatus: 'none',
  },
  'superadmin-openid': {
    id: 2,
    openId: 'superadmin-openid',
    name: 'Super Administrateur',
    email: 'admin@beninfreelance.com',
    userType: 'client',
    isSeller: false,
    role: 'superadmin',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    kycStatus: 'verified',
  },
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // First check for test account session cookie
    const cookies = opts.req.headers.cookie ? parseCookieHeader(opts.req.headers.cookie) : {};
    const sessionCookie = cookies['app_session_id'];
    
    if (sessionCookie) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(sessionCookie, secret);
        const openId = payload.openId as string;
        
        // Check if it's a test account
        if (TEST_ACCOUNTS[openId]) {
          user = TEST_ACCOUNTS[openId] as User;
        }
      } catch (e) {
        // Not a test account token, continue with normal auth
      }
    }
    
    // If not a test account, try normal OAuth authentication
    if (!user) {
      user = await sdk.authenticateRequest(opts.req);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
