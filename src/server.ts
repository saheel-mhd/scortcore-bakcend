import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

const DISCONNECT_TIMEOUT_MS = 2000;

const connectToDatabase = async (): Promise<void> => {
  let timeoutHandle: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(
        new Error(
          `Database connection timed out after ${env.DATABASE_CONNECT_TIMEOUT_MS}ms`,
        ),
      );
    }, env.DATABASE_CONNECT_TIMEOUT_MS);
  });

  try {
    await Promise.race([prisma.$connect(), timeoutPromise]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};

const disconnectDatabase = async (): Promise<void> => {
  try {
    await Promise.race([
      prisma.$disconnect(),
      new Promise<void>((resolve) => {
        setTimeout(resolve, DISCONNECT_TIMEOUT_MS);
      }),
    ]);
  } catch {
    // Ignore disconnect errors during shutdown.
  }
};

const startServer = async (): Promise<void> => {
  await connectToDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    console.log(`${signal} received. Shutting down gracefully.`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
};

void startServer().catch(async (error: unknown) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
