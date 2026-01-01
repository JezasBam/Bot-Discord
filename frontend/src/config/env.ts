/**
 * Environment configuration for frontend
 * Uses Vite environment variables with fallbacks for development
 */

export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
