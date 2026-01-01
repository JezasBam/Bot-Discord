/**
 * CORS configuration
 * Uses environment variables with fallbacks for development
 */

const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(",") || [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3004",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3004",
];

export { CORS_ORIGINS };
