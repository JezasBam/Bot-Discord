import { useState, useEffect, useCallback } from "react";
import { api, type Guild, type GuildChannels } from "@/api/client";

export function useGuilds(isConnected: boolean) {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);
  const [channels, setChannels] = useState<GuildChannels | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuilds = useCallback(async () => {
    if (!isConnected) return;

    console.log("🔍 Fetching guilds - isConnected:", isConnected);
    setLoading(true);
    setError(null);

    try {
      const result = await api.getGuilds();
      console.log("✅ Guilds fetched:", result.length, "guilds");
      setGuilds(result);

      if (result.length === 1) {
        console.log("🎯 Auto-selecting single guild:", result[0]!.name);
        setSelectedGuildId(result[0]!.id);
      }
    } catch (err) {
      console.error("❌ Failed to fetch guilds:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch guilds");
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  const fetchChannels = useCallback(async (guildId: string, force = false) => {
    console.log("🔍 Fetching channels for guild:", guildId, "force:", force);
    if (force) {
      setChannels(null); // Clear to force UI update
    }
    setLoading(true);
    setError(null);

    try {
      const result = await api.getGuildChannels(guildId);
      console.log("✅ Channels fetched:", result);
      console.log("📊 Categories:", result.categories.length, "Uncategorized:", result.uncategorized.length);
      setChannels(result);
      console.log("Channels fetched:", result.categories.length, "categories");
    } catch (err) {
      console.error("❌ Failed to fetch channels:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch channels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("🔄 Guilds useEffect - isConnected:", isConnected, "fetchGuilds:", !!fetchGuilds);
    if (isConnected) {
      fetchGuilds();
    } else {
      setGuilds([]);
      setSelectedGuildId(null);
      setChannels(null);
    }
  }, [isConnected, fetchGuilds]);

  useEffect(() => {
    console.log("🔄 Channels useEffect - selectedGuildId:", selectedGuildId, "fetchChannels:", !!fetchChannels);
    if (selectedGuildId) {
      fetchChannels(selectedGuildId);
    } else {
      setChannels(null);
    }
  }, [selectedGuildId, fetchChannels]);

  const selectGuild = useCallback((guildId: string | null) => {
    setSelectedGuildId(guildId);
  }, []);

  const refreshAll = useCallback(async () => {
    await fetchGuilds();
    if (selectedGuildId) {
      await fetchChannels(selectedGuildId);
    }
  }, [fetchGuilds, fetchChannels, selectedGuildId]);

  return {
    guilds,
    selectedGuildId,
    channels,
    loading,
    error,
    selectGuild,
    refresh: refreshAll,
    refreshChannels: () =>
      selectedGuildId
        ? fetchChannels(selectedGuildId, true)
        : Promise.resolve(),
  };
}
