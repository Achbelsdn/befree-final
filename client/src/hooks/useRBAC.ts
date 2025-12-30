import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";

// Role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY: Record<string, number> = {
  user: 0,
  client: 1,
  freelance: 2,
  moderator: 3,
  admin: 4,
  superadmin: 5,
};

// Permissions by role
const ROLE_PERMISSIONS: Record<string, string[]> = {
  user: [
    "view:services",
    "view:projects",
    "view:profiles",
  ],
  client: [
    "view:services",
    "view:projects",
    "view:profiles",
    "create:projects",
    "edit:own_projects",
    "delete:own_projects",
    "create:orders",
    "view:own_orders",
    "message:freelancers",
    "review:freelancers",
  ],
  freelance: [
    "view:services",
    "view:projects",
    "view:profiles",
    "create:services",
    "edit:own_services",
    "delete:own_services",
    "apply:projects",
    "view:own_orders",
    "message:clients",
    "review:clients",
    "manage:portfolio",
    "manage:certifications",
    "submit:kyc",
  ],
  moderator: [
    "view:services",
    "view:projects",
    "view:profiles",
    "view:all_orders",
    "view:reports",
    "moderate:reviews",
    "moderate:services",
    "view:kyc",
  ],
  admin: [
    "view:services",
    "view:projects",
    "view:profiles",
    "view:all_orders",
    "view:reports",
    "moderate:reviews",
    "moderate:services",
    "view:kyc",
    "approve:kyc",
    "reject:kyc",
    "manage:categories",
    "manage:users",
    "view:transactions",
    "view:analytics",
    "manage:disputes",
  ],
  superadmin: [
    "*", // All permissions
  ],
};

export type Role = "user" | "client" | "freelance" | "moderator" | "admin" | "superadmin";
export type UserType = "client" | "freelance";

export interface RBACUser {
  id: number;
  role: Role;
  userType: UserType;
  isSeller: boolean;
  kycStatus?: "none" | "pending" | "verified" | "rejected";
}

export function useRBAC() {
  const { user, isAuthenticated } = useAuth();

  // Get effective role based on user data
  const getEffectiveRole = (): Role => {
    if (!user) return "user";
    
    // Admin roles take precedence
    if (user.role === "superadmin" || user.role === "admin" || user.role === "moderator") {
      return user.role as Role;
    }
    
    // For regular users, use userType
    if (user.isSeller || user.userType === "freelance") {
      return "freelance";
    }
    
    return "client";
  };

  const effectiveRole = getEffectiveRole();

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !user) return false;
    
    const permissions = ROLE_PERMISSIONS[effectiveRole] || [];
    
    // Superadmin has all permissions
    if (permissions.includes("*")) return true;
    
    return permissions.includes(permission);
  };

  // Check if user has any of the given permissions
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  // Check if user has all of the given permissions
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  // Check if user has a specific role
  const hasRole = (role: Role): boolean => {
    if (!isAuthenticated || !user) return false;
    return effectiveRole === role;
  };

  // Check if user has at least the given role level
  const hasMinRole = (minRole: Role): boolean => {
    if (!isAuthenticated || !user) return false;
    const userLevel = ROLE_HIERARCHY[effectiveRole] || 0;
    const minLevel = ROLE_HIERARCHY[minRole] || 0;
    return userLevel >= minLevel;
  };

  // Check if user is admin (admin or superadmin)
  const isAdmin = (): boolean => {
    return hasMinRole("admin");
  };

  // Check if user is moderator or higher
  const isModerator = (): boolean => {
    return hasMinRole("moderator");
  };

  // Check if user is a freelancer
  const isFreelancer = (): boolean => {
    if (!user) return false;
    return user.isSeller || user.userType === "freelance";
  };

  // Check if user is a client
  const isClient = (): boolean => {
    if (!user) return false;
    return !user.isSeller && user.userType === "client";
  };

  // Check if user's KYC is verified
  const isKYCVerified = (): boolean => {
    if (!user) return false;
    return user.kycStatus === "verified";
  };

  // Check if user can access admin dashboard
  const canAccessAdminDashboard = (): boolean => {
    return hasMinRole("moderator");
  };

  // Check if user can manage KYC
  const canManageKYC = (): boolean => {
    return hasPermission("approve:kyc") || hasPermission("reject:kyc");
  };

  // Check if user can create services (must be freelancer with verified KYC)
  const canCreateServices = (): boolean => {
    return isFreelancer() && hasPermission("create:services");
  };

  // Check if user can apply to projects
  const canApplyToProjects = (): boolean => {
    return isFreelancer() && hasPermission("apply:projects");
  };

  return {
    user,
    isAuthenticated,
    effectiveRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasMinRole,
    isAdmin,
    isModerator,
    isFreelancer,
    isClient,
    isKYCVerified,
    canAccessAdminDashboard,
    canManageKYC,
    canCreateServices,
    canApplyToProjects,
  };
}

// Higher-order component for role-based access
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: Role,
  FallbackComponent?: React.ComponentType
) {
  return function RoleGuardedComponent(props: P) {
    const { hasMinRole, isAuthenticated } = useRBAC();

    if (!isAuthenticated) {
      // Redirect to login or show login prompt
      return FallbackComponent ? React.createElement(FallbackComponent) : null;
    }

    if (!hasMinRole(requiredRole)) {
      // Show unauthorized message or redirect
      return FallbackComponent ? React.createElement(FallbackComponent) : null;
    }

    return React.createElement(Component, props);
  };
}

// Permission guard component
export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: {
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission, hasAnyPermission } = useRBAC();

  const hasAccess = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission);

  if (!hasAccess) {
    return React.createElement(React.Fragment, null, fallback);
  }

  return React.createElement(React.Fragment, null, children);
}

// Role guard component
export function RoleGuard({
  role,
  minRole,
  children,
  fallback = null,
}: {
  role?: Role;
  minRole?: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasRole, hasMinRole } = useRBAC();

  let hasAccess = false;
  
  if (role) {
    hasAccess = hasRole(role);
  } else if (minRole) {
    hasAccess = hasMinRole(minRole);
  }

  if (!hasAccess) {
    return React.createElement(React.Fragment, null, fallback);
  }

  return React.createElement(React.Fragment, null, children);
}
