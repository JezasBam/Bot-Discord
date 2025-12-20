let isShuttingDown = false;

export function setupGracefulShutdown({ client, logger, onShutdown }) {
  const shutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}, shutting down gracefully...`);

    try {
      if (onShutdown) await onShutdown();
    } catch (err) {
      logger.error('Error during shutdown cleanup:', err);
    }

    try {
      client.destroy();
      logger.info('Discord client destroyed');
    } catch (err) {
      logger.error('Error destroying client:', err);
    }

    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
