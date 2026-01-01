import { useState, useCallback } from "react";
import { api, type DiscordMessage, type MessageEmbed } from "@/api/client";

export function useChannelMessages() {
  const [messages, setMessages] = useState<DiscordMessage[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(
    async (
      channelId: string,
      embedsOnly = false,
      preserveSelection = false,
    ) => {
      setLoading(true);
      setError(null);

      try {
        const result = await api.getChannelMessages(channelId, embedsOnly);
        setMessages(result);
        if (!preserveSelection) {
          setSelectedMessageId(null);
        } else {
          // If the selected message no longer exists, clear selection.
          setSelectedMessageId((prev) =>
            prev && result.some((m) => m.id === prev) ? prev : null,
          );
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch messages",
        );
        setMessages([]);
        if (!preserveSelection) {
          setSelectedMessageId(null);
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const sendMessage = useCallback(
    async (
      channelId: string,
      payload: { content?: string; embeds?: MessageEmbed[] },
    ) => {
      setLoading(true);
      setError(null);

      try {
        const message = await api.sendMessage(channelId, payload);
        setMessages((prev) => [message, ...prev]);
        return message;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const editMessage = useCallback(
    async (
      messageId: string,
      channelId: string,
      payload: { content?: string; embeds?: MessageEmbed[] },
    ) => {
      setLoading(true);
      setError(null);

      try {
        const updated = await api.editMessage(messageId, channelId, payload);
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? updated : msg)),
        );
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to edit message");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteMessage = useCallback(
    async (messageId: string, channelId: string, keepSelection = false) => {
      setLoading(true);
      setError(null);

      try {
        await api.deleteMessage(messageId, channelId);
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        if (!keepSelection) {
          setSelectedMessageId((prev) => (prev === messageId ? null : prev));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete message",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const selectedMessage =
    messages.find((m) => m.id === selectedMessageId) ?? null;

  return {
    messages,
    selectedMessage,
    selectedMessageId,
    loading,
    error,
    fetchMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    selectMessage: setSelectedMessageId,
  };
}
