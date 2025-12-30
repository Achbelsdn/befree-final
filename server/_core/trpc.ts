import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY: Record<string, number> = {
  user: 0,
  client: 1,
  freelance: 2,
  moderator: 3,
  admin: 4,
  superadmin: 5,
};

// Middleware: Require authenticated user
const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Middleware: Require minimum role level
const requireMinRole = (minRole: string) => t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  const userRole = ctx.user.role || 'user';
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

  if (userLevel < requiredLevel) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: `Cette action nécessite au minimum le rôle: ${minRole}` 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Middleware: Require specific role
const requireRole = (role: string) => t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  if (ctx.user.role !== role) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: `Cette action nécessite le rôle: ${role}` 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Middleware: Require freelancer (seller)
const requireFreelancer = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  if (!ctx.user.isSeller && ctx.user.userType !== 'freelance') {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Cette action est réservée aux freelances" 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Middleware: Require verified KYC
const requireVerifiedKYC = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  if (ctx.user.kycStatus !== 'verified') {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Votre identité doit être vérifiée pour effectuer cette action" 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Middleware: Require client
const requireClient = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  if (ctx.user.isSeller || ctx.user.userType === 'freelance') {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Cette action est réservée aux clients" 
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Export procedures with different access levels
export const protectedProcedure = t.procedure.use(requireUser);

// Admin procedures (admin or superadmin)
export const adminProcedure = t.procedure.use(requireMinRole('admin'));

// Superadmin only procedures
export const superAdminProcedure = t.procedure.use(requireRole('superadmin'));

// Moderator procedures (moderator, admin, or superadmin)
export const moderatorProcedure = t.procedure.use(requireMinRole('moderator'));

// Freelancer procedures
export const freelancerProcedure = t.procedure.use(requireUser).use(requireFreelancer);

// Client procedures
export const clientProcedure = t.procedure.use(requireUser).use(requireClient);

// KYC verified procedures (for actions requiring identity verification)
export const verifiedProcedure = t.procedure.use(requireUser).use(requireVerifiedKYC);

// Freelancer with verified KYC
export const verifiedFreelancerProcedure = t.procedure
  .use(requireUser)
  .use(requireFreelancer)
  .use(requireVerifiedKYC);

// Helper function to check role in route handlers
export function hasMinRole(userRole: string | undefined, minRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole || 'user'] || 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] || 0;
  return userLevel >= requiredLevel;
}

// Helper function to check if user is admin
export function isAdmin(userRole: string | undefined): boolean {
  return hasMinRole(userRole, 'admin');
}

// Helper function to check if user is moderator or higher
export function isModerator(userRole: string | undefined): boolean {
  return hasMinRole(userRole, 'moderator');
}
