import { useEffect, useState } from "react";
import { api, type BotInfo } from "@/api/client";

export function useBotInfo() {
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetch = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let cancelled = false;
    api
      .bot()
      .then((data) => {
        if (!cancelled) setBotInfo(data);
      })
      .catch(() => {
        // ignore errors, botInfo remains null
      });
    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  return { botInfo, refetch };
}
