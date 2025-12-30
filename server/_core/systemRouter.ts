import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import * as db from "../db";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  // Get platform statistics for homepage
  getStats: publicProcedure.query(async () => {
    try {
      const stats = await db.getPlatformStats();
      return stats;
    } catch (error) {
      console.warn("[System] Failed to get stats:", error);
      // Return default values if database is not available
      return {
        freelancers: 0,
        completedProjects: 0,
        satisfactionRate: 0,
        avgResponseTime: 0,
      };
    }
  }),

  // Public stats for homepage (alias)
  stats: publicProcedure.query(async () => {
    try {
      const stats = await db.getPlatformStats();
      return {
        totalFreelancers: stats.freelancers || 0,
        totalOrders: stats.completedProjects || 0,
        averageRating: "4.8",
        satisfactionRate: stats.satisfactionRate || 98,
        averageResponseTime: stats.avgResponseTime ? `${stats.avgResponseTime}h` : "24h",
      };
    } catch (error) {
      console.warn("[System] Failed to get stats:", error);
      return {
        totalFreelancers: 0,
        totalOrders: 0,
        averageRating: "4.8",
        satisfactionRate: 98,
        averageResponseTime: "24h",
      };
    }
  }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
