import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db", () => ({
  getServices: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      categoryId: 1,
      title: "Test Service",
      slug: "test-service",
      description: "Test description",
      shortDescription: "Short desc",
      price: "5000",
      currency: "XOF",
      deliveryTime: 3,
      revisions: 2,
      coverImage: null,
      images: null,
      features: "[]",
      requirements: null,
      tags: null,
      status: "active",
      totalStars: 0,
      starCount: 0,
      totalOrders: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getPopularServices: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      categoryId: 1,
      title: "Popular Service",
      slug: "popular-service",
      description: "Popular description",
      shortDescription: "Short desc",
      price: "10000",
      currency: "XOF",
      deliveryTime: 5,
      revisions: 3,
      coverImage: null,
      images: null,
      features: "[]",
      requirements: null,
      tags: null,
      status: "active",
      totalStars: 45,
      starCount: 10,
      totalOrders: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getServiceById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    categoryId: 1,
    title: "Test Service",
    slug: "test-service",
    description: "Test description",
    shortDescription: "Short desc",
    price: "5000",
    currency: "XOF",
    deliveryTime: 3,
    revisions: 2,
    coverImage: null,
    images: null,
    features: "[]",
    requirements: null,
    tags: null,
    status: "active",
    totalStars: 0,
    starCount: 0,
    totalOrders: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getAllCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Développement & IT", slug: "developpement-it", description: null, icon: "code", image: null, color: null, createdAt: new Date() },
    { id: 2, name: "Design & Créatif", slug: "design-creatif", description: null, icon: "palette", image: null, color: null, createdAt: new Date() },
  ]),
  getUserById: vi.fn().mockResolvedValue({
    id: 1,
    openId: "test-user",
    name: "Test User",
    email: "test@example.com",
    avatar: null,
    bio: "Test bio",
    phone: null,
    city: "Cotonou",
    country: "Bénin",
    skills: "[]",
    languages: "[]",
    responseTime: null,
    isSeller: true,
    rating: "4.5",
    completedOrders: 10,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  }),
}));

function createPublicContext(): TrpcContext {
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

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      isSeller: true,
      avatar: null,
      bio: "Test bio",
      phone: null,
      city: "Cotonou",
      country: "Bénin",
      skills: "[]",
      languages: "[]",
      responseTime: null,
      rating: "4.5",
      completedOrders: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Service Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list services without authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.service.list({});

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("title");
    expect(result[0]).toHaveProperty("price");
  });

  it("should get popular services", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.service.popular({ limit: 8 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty("title", "Popular Service");
  });

  it("should get a service by ID", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.service.getById({ id: 1 });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("id", 1);
    expect(result).toHaveProperty("title", "Test Service");
  });
});

describe("Category Routes", () => {
  it("should list all categories", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.category.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty("name", "Développement & IT");
  });
});

describe("User Routes", () => {
  it("should get user profile by ID", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.user.getProfile({ userId: 1 });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("name", "Test User");
    expect(result).toHaveProperty("city", "Cotonou");
    expect(result).toHaveProperty("isSeller", true);
  });

  it("should return current user for authenticated requests", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeDefined();
    expect(result).toHaveProperty("name", "Test User");
    expect(result).toHaveProperty("email", "test@example.com");
  });

  it("should return null for unauthenticated auth.me requests", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeNull();
  });
});
