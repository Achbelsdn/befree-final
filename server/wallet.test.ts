import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("wallet router", () => {
  describe("wallet.get", () => {
    it("returns wallet for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.wallet.get();
      
      // Should return a wallet object (either existing or newly created)
      expect(result).toBeDefined();
      expect(result).toHaveProperty("balance");
      expect(result).toHaveProperty("pendingBalance");
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.wallet.get()).rejects.toThrow();
    });
  });

  describe("wallet.transactions", () => {
    it("returns transactions for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.wallet.transactions({ limit: 10 });
      
      expect(Array.isArray(result)).toBe(true);
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.wallet.transactions({ limit: 10 })).rejects.toThrow();
    });
  });

  describe("wallet.withdraw", () => {
    it("validates minimum withdrawal amount", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // Amount below minimum should fail
      await expect(
        caller.wallet.withdraw({
          amount: 500, // Below 1000 minimum
          paymentMethod: "mtn",
          phoneNumber: "97000000",
        })
      ).rejects.toThrow();
    });

    it("validates phone number", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // Empty phone number should fail
      await expect(
        caller.wallet.withdraw({
          amount: 5000,
          paymentMethod: "mtn",
          phoneNumber: "",
        })
      ).rejects.toThrow();
    });
  });

  describe("wallet.deposit", () => {
    it("creates a deposit transaction", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.wallet.deposit({
        amount: 5000,
        paymentMethod: "moov",
        phoneNumber: "97000000",
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});

describe("project router", () => {
  describe("project.create", () => {
    it("creates a project for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.project.create({
        title: "Test Project",
        description: "A test project description",
        budget: "50000",
      });

      // The create function returns the inserted ID
      expect(result).toBeDefined();
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.project.create({
          title: "Test Project",
          description: "A test project description",
          budget: "50000",
        })
      ).rejects.toThrow();
    });
  });

  describe("project.myProjects", () => {
    it("returns user's projects", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.project.myProjects();
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("project.openProjects", () => {
    it("returns open projects", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.project.openProjects({ limit: 10 });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe("dashboard router", () => {
  describe("dashboard.stats", () => {
    it("returns stats for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.dashboard.stats();
      
      // Stats can be null if db is not available, or an object with stats
      if (result !== null) {
        expect(result).toHaveProperty("totalOrders");
      }
    });

    it("throws error for unauthenticated user", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.dashboard.stats()).rejects.toThrow();
    });
  });

  describe("dashboard.recentActivity", () => {
    it("returns recent activity for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.dashboard.recentActivity({ limit: 5 });
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty("orders");
      expect(result).toHaveProperty("transactions");
      expect(Array.isArray(result.orders)).toBe(true);
      expect(Array.isArray(result.transactions)).toBe(true);
    });
  });
});

describe("notification router", () => {
  describe("notification.list", () => {
    it("returns notifications for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notification.list({ limit: 10 });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("notification.unreadCount", () => {
    it("returns unread count for authenticated user", async () => {
      const ctx = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.notification.unreadCount();
      
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });
});
