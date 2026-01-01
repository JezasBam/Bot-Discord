import { useState, useEffect } from "react";
import type { BotProfile } from "../components/BotProfileEditor";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export function useBotProfile() {
  const [profile, setProfile] = useState<BotProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/bot`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.user) {
        setProfile(data.user);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch bot profile",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: {
    username?: string;
    avatar?: string;
  }) => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE}/api/bot/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage =
          errorData.error || `HTTP ${response.status}: ${response.statusText}`;

        // Handle specific error codes
        if (response.status === 429) {
          const retryAfter = errorData.retryAfter || 600; // Default to 10 minutes for repeated attempts
          errorMessage = `Ai schimbat numele prea repede. Așteaptă ${retryAfter} secunde înainte să încerci din nou.`;

          // Store retry time in localStorage for persistence across page reloads
          localStorage.setItem(
            "usernameRateLimit",
            (Date.now() + retryAfter * 1000).toString(),
          );
        } else if (errorData.details) {
          if (errorData.details.includes("USERNAME_TOO_MANY_USERS")) {
            errorMessage =
              'Acest nume este prea comun. Încearcă un nume mai unic (ex: "ProtectorulBot", "Protectorul2025").';
          } else if (errorData.details.includes("USERNAME_RATE_LIMIT")) {
            const retryAfter = errorData.retryAfter || 300;
            errorMessage = `Ai schimbat numele prea repede. Așteaptă ${retryAfter} secunde înainte să încerci din nou.`;
            localStorage.setItem(
              "usernameRateLimit",
              (Date.now() + retryAfter * 1000).toString(),
            );
          } else if (errorData.details.includes("USERNAME_INVALID")) {
            errorMessage =
              "Numele conține caractere invalide. Folosește doar litere, cifre și câteva caractere speciale.";
          } else {
            errorMessage = `Eroare Discord: ${errorData.details}`;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.user) {
        setProfile(data.user);
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update bot profile";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}
