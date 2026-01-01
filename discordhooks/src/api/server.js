import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { createGuildsRouter } from "./routes/guilds.js";
import { createChannelsRouter } from "./routes/channels.js";
import { createMessagesRouter } from "./routes/messages.js";
import { createBotRouter } from "./routes/bot.js";
import { createAuthRouter } from "./routes/auth.js";
import { CORS_ORIGINS } from "../config/cors.js";

export function createApiServer(client, logger) {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: CORS_ORIGINS,
      credentials: true,
    },
  });

  app.use(
    cors({
      origin: CORS_ORIGINS,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  app.use((req, res, next) => {
    logger.debug(`API ${req.method} ${req.path}`);
    next();
  });

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      botReady: client.isReady(),
      guilds: client.guilds.cache.size,
    });
  });

  app.use("/api/guilds", createGuildsRouter(client, logger));
  app.use("/api/channels", createChannelsRouter(client, logger));
  app.use("/api/messages", createMessagesRouter(client, logger));
  app.use("/api/bot", createBotRouter(client, logger));
  app.use("/api/auth", createAuthRouter(logger));

  app.use((err, req, res) => {
    logger.error("API error:", err);
    res.status(500).json({ error: err.message });
  });

  io.on("connection", (socket) => {
    logger.info("Client connected to WebSocket");
    socket.on("disconnect", () => {
      logger.info("Client disconnected from WebSocket");
    });
  });

  return { app, httpServer, io };
}

export function startApiServer(client, logger, port = 3001) {
  const { httpServer, io } = createApiServer(client, logger);

  return new Promise((resolve) => {
    httpServer.listen(port, () => {
      logger.info(`API server running on http://localhost:${port}`);
      resolve({ server: httpServer, io });
    });
  });
}
