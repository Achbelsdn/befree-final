import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { createUploadRouter } from "../uploadRoutes";
import { Server as SocketIOServer } from "socket.io";
import { setupSocketIO } from "../socketHandler";
import { processAutoReleases, sendValidationReminders } from "../escrow";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// Simple cron-like scheduler using setInterval
function setupEscrowCronJobs() {
  const ONE_HOUR = 60 * 60 * 1000;
  const ONE_DAY = 24 * ONE_HOUR;
  
  // Run auto-release check every day at startup and then every 24 hours
  console.log('[CRON] Scheduling escrow auto-release job (daily)');
  
  // Initial run after 5 minutes to let the server stabilize
  setTimeout(async () => {
    console.log('[CRON] Running initial auto-release check...');
    try {
      const result = await processAutoReleases();
      console.log(`[CRON] Auto-release completed: ${result.processed} processed, ${result.errors} errors`);
    } catch (error) {
      console.error('[CRON] Auto-release error:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes after startup
  
  // Then run every 24 hours
  setInterval(async () => {
    console.log('[CRON] Running scheduled auto-release check...');
    try {
      const result = await processAutoReleases();
      console.log(`[CRON] Auto-release completed: ${result.processed} processed, ${result.errors} errors`);
    } catch (error) {
      console.error('[CRON] Auto-release error:', error);
    }
  }, ONE_DAY);
  
  // Run validation reminders every 12 hours
  console.log('[CRON] Scheduling validation reminder job (every 12 hours)');
  
  setInterval(async () => {
    console.log('[CRON] Sending validation reminders...');
    try {
      const result = await sendValidationReminders();
      console.log(`[CRON] Sent ${result.sent} validation reminders`);
    } catch (error) {
      console.error('[CRON] Reminder error:', error);
    }
  }, 12 * ONE_HOUR);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Initialize Socket.IO for real-time messaging
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NODE_ENV === "development" 
        ? ["http://localhost:3000", "http://localhost:5173"] 
        : true,
      credentials: true,
    },
  });
  
  // Setup Socket.IO handlers
  setupSocketIO(io);
  
  // Make io available to routes
  app.set('io', io);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // File upload routes
  app.use("/api", createUploadRouter());
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`Socket.IO enabled for real-time messaging`);
    
    // Setup escrow cron jobs after server starts
    setupEscrowCronJobs();
  });
}

startServer().catch(console.error);
