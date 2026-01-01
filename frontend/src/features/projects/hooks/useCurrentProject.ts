import { useState, useEffect } from "react";

const STORAGE_KEY = "embed-builder:currentProjectId";

export function useCurrentProject() {
  const [currentProjectId, setCurrentProjectIdState] = useState<string | null>(
    () => {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    },
  );

  useEffect(() => {
    try {
      if (currentProjectId) {
        localStorage.setItem(STORAGE_KEY, currentProjectId);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage might be unavailable
    }
  }, [currentProjectId]);

  const setCurrentProjectId = (id: string | null) => {
    setCurrentProjectIdState(id);
  };

  return {
    currentProjectId,
    setCurrentProjectId,
  };
}
