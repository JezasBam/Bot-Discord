export class BotError extends Error {
  constructor(message, code = 'BOT_ERROR', userMessage = 'An error occurred.') {
    super(message);
    this.name = 'BotError';
    this.code = code;
    this.userMessage = userMessage;
  }
}

export class TicketError extends BotError {
  constructor(message, code = 'TICKET_ERROR', userMessage = 'A ticket error occurred.') {
    super(message, code, userMessage);
    this.name = 'TicketError';
  }
}

export class ConfigError extends BotError {
  constructor(message, code = 'CONFIG_ERROR', userMessage = 'Configuration error.') {
    super(message, code, userMessage);
    this.name = 'ConfigError';
  }
}

export class PermissionError extends BotError {
  constructor(message, code = 'PERMISSION_ERROR', userMessage = 'You do not have permission.') {
    super(message, code, userMessage);
    this.name = 'PermissionError';
  }
}

export function isBotError(err) {
  return err instanceof BotError;
}

export function getUserMessage(err) {
  if (isBotError(err)) {
    return err.userMessage;
  }
  return 'An unexpected error occurred.';
}
