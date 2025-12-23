import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createGuildsRouter } from './routes/guilds.js';
import { createChannelsRouter } from './routes/channels.js';
import { createMessagesRouter } from './routes/messages.js';

const CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3004', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3004'];

export function createApiServer(client, logger) {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: CORS_ORIGINS,
      credentials: true
    }
  });

  app.use(cors({
    origin: CORS_ORIGINS,
    credentials: true
  }));
  app.use(express.json());

  app.use((req, res, next) => {
    logger.debug(`API ${req.method} ${req.path}`);
    next();
  });

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      botReady: client.isReady(),
      guilds: client.guilds.cache.size
    });
  });

  app.get('/api/bot', (req, res) => {
    const user = client.user;
    res.json({
      botReady: client.isReady(),
      user: user
        ? {
            id: user.id,
            username: user.username,
            tag: user.tag,
            avatarUrl: user.displayAvatarURL({ extension: 'png', size: 128 })
          }
        : null
    });
  });

  app.use('/api/guilds', createGuildsRouter(client, logger));
  app.use('/api/channels', createChannelsRouter(client, logger));
  app.use('/api/messages', createMessagesRouter(client, logger));

  app.use((err, req, res, next) => {
    logger.error('API error:', err);
    res.status(500).json({ error: err.message });
  });

  io.on('connection', (socket) => {
    logger.info('Client connected to WebSocket');
    socket.on('disconnect', () => {
      logger.info('Client disconnected from WebSocket');
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
