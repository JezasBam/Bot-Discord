import { useState, useEffect, useCallback } from "react";
import { Layout } from "./layout/Layout";
import { ChannelsSidebar } from "@/features/discord/components/ChannelsSidebar";
import { EmbedEditor } from "@/features/embedEditor/components/EmbedEditor";
import { EmbedPreview } from "@/features/embedEditor/preview/EmbedPreview";
import { BotProfileEditor } from "@/features/discord/components/BotProfileEditor";
import { useConnection } from "@/features/discord/hooks/useConnection";
import { useGuilds } from "@/features/discord/hooks/useGuilds";
import { useChannelMessages } from "@/features/discord/hooks/useChannelMessages";
import { useSocket } from "@/features/discord/hooks/useSocket";
import { useBotProfile } from "@/features/discord/hooks/useBotProfile";
import { useBotInfo } from "@/hooks/useBotInfo";
import { type WebhookPayload, type Embed } from "@/features/embedEditor/types";
import {
  createEmptyPayload,
  createEmptyEmbed,
} from "@/features/embedEditor/utils/payload";
import { validatePayload } from "@/features/embedEditor/validators";
import type { MessageEmbed } from "@/api/client";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ConfirmationModal } from "@/components/ConfirmationModal";

function convertDiscordEmbed(embed: MessageEmbed): Embed {
  return {
    id: crypto.randomUUID(), // Generate new ID for converted embeds
    title: embed.title,
    description: embed.description,
    url: embed.url,
    color: embed.color,
    author: embed.author?.name
      ? {
          name: embed.author.name,
          url: embed.author.url,
          icon_url: embed.author.icon_url,
        }
      : undefined,
    footer: embed.footer?.text
      ? {
          text: embed.footer.text,
          icon_url: embed.footer.icon_url,
        }
      : undefined,
    thumbnail: embed.thumbnail?.url ? { url: embed.thumbnail.url } : undefined,
    image: embed.image?.url ? { url: embed.image.url } : undefined,
    fields: embed.fields || [],
    timestamp: embed.timestamp,
  };
}

export default function App() {
  const { status, error, connect, disconnect, isConnected } = useConnection();
  const {
    selectedGuildId,
    channels,
    loading: guildsLoading,
    refresh,
    refreshChannels,
    selectGuild,
  } = useGuilds(isConnected);
  const {
    messages,
    selectedMessage,
    selectedMessageId,
    loading: messagesLoading,
    fetchMessages,
    sendMessage,
    deleteMessage,
    selectMessage,
  } = useChannelMessages();
  const { profile, updateProfile, refetch } = useBotProfile();

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );
  const [localPayload, setLocalPayload] =
    useState<WebhookPayload>(createEmptyPayload());
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showBotProfileEditor, setShowBotProfileEditor] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [pendingDeleteMessageId, setPendingDeleteMessageId] = useState<string | null>(null);
  const [confirmationDisabledUntil, setConfirmationDisabledUntil] = useState<number | null>(() => {
    const stored = localStorage.getItem('confirmationDisabledUntil');
    return stored ? parseInt(stored) : null;
  });
  const [shouldShowDeleteModal, setShouldShowDeleteModal] = useState(() => {
    // Check if this is a page refresh/re-entry
    const hasVisited = sessionStorage.getItem('hasVisitedPage');
    if (!hasVisited) {
      sessionStorage.setItem('hasVisitedPage', 'true');
      return true; // Show modal on first visit
    }
    return false;
  });

  const handleChannelUpdateFromSocket = useCallback(async () => {
    console.log("Socket: channels updated, refreshing...");
    await refreshChannels();
  }, [refreshChannels]);

  const handleMessageUpdateFromSocket = useCallback(() => {
    if (selectedChannelId) {
      console.log("Socket: messages updated, refreshing...");
      fetchMessages(selectedChannelId, true, true);
    }
  }, [selectedChannelId, fetchMessages]);

  useSocket(
    isConnected,
    selectedGuildId,
    selectedChannelId,
    handleChannelUpdateFromSocket,
    handleMessageUpdateFromSocket,
  );

  // Show delete modal on page refresh/re-entry
  useEffect(() => {
    if (shouldShowDeleteModal && selectedChannelId) {
      // Auto-show the delete confirmation modal on page refresh
      // You can customize this behavior as needed
      console.log("Page refreshed - delete modal would show here");
      setShouldShowDeleteModal(false);
    }
  }, [shouldShowDeleteModal, selectedChannelId]);

  // Sync confirmationDisabledUntil with localStorage and check expiration
  useEffect(() => {
    if (confirmationDisabledUntil) {
      const now = Date.now();
      if (now > confirmationDisabledUntil) {
        // Time expired, re-enable confirmation
        setConfirmationDisabledUntil(null);
        localStorage.removeItem('confirmationDisabledUntil');
      } else {
        // Update localStorage with current value
        localStorage.setItem('confirmationDisabledUntil', confirmationDisabledUntil.toString());
      }
    }
  }, [confirmationDisabledUntil]);

  const { botInfo, refetch: refetchBotInfo } = useBotInfo();

  useEffect(() => {
    if (selectedMessage) {
      setLocalPayload({
        content: selectedMessage.content || "",
        username: "",
        avatar_url: "",
        embeds: selectedMessage.embeds.map(convertDiscordEmbed),
      });
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [selectedMessage]);

  const handleSelectChannel = async (channelId: string) => {
    setSelectedChannelId(channelId);
    // Switching channels should reset selected project/message.
    selectMessage(null);
    setIsEditing(false);
    await fetchMessages(channelId, true, false);
  };

  const handleNewEmbed = () => {
    setLocalPayload({
      ...createEmptyPayload(),
      embeds: [createEmptyEmbed()],
    });
    selectMessage(null);
    setIsEditing(false);
  };

  const handleDeleteProject = async (messageId: string) => {
    if (!selectedChannelId) return;
    
    // Check if confirmation is disabled
    const now = Date.now();
    const isConfirmationDisabled = confirmationDisabledUntil && now < confirmationDisabledUntil;
    
    if (isConfirmationDisabled) {
      // Delete directly without confirmation
      try {
        await deleteMessage(messageId, selectedChannelId);

        if (selectedMessageId === messageId) {
          selectMessage(null);
          setIsEditing(false);
          setLocalPayload({
            ...createEmptyPayload(),
            embeds: [createEmptyEmbed()],
          });
        }

        await fetchMessages(selectedChannelId, true, true);
      } catch (err) {
        console.error("Failed to delete project:", err);
        setSaveStatus("error");
        setSaveError(
          err instanceof Error ? err.message : "Failed to delete project",
        );
      }
    } else {
      // Show confirmation modal
      setPendingDeleteMessageId(messageId);
      setShowDeleteConfirmation(true);
    }
  };

  const confirmDeleteProject = async () => {
    if (!pendingDeleteMessageId || !selectedChannelId) return;
    
    try {
      await deleteMessage(pendingDeleteMessageId, selectedChannelId);

      if (selectedMessageId === pendingDeleteMessageId) {
        selectMessage(null);
        setIsEditing(false);
        setLocalPayload({
          ...createEmptyPayload(),
          embeds: [createEmptyEmbed()],
        });
      }

      await fetchMessages(selectedChannelId, true, true);
    } catch (err) {
      console.error("Failed to delete project:", err);
      setSaveStatus("error");
      setSaveError(
        err instanceof Error ? err.message : "Failed to delete project",
      );
    } finally {
      setShowDeleteConfirmation(false);
      setPendingDeleteMessageId(null);
    }
  };

  const cancelDeleteProject = () => {
    setShowDeleteConfirmation(false);
    setPendingDeleteMessageId(null);
  };

  const handleAdditionalAction = () => {
    // Disable confirmation for 5 minutes (300000 milliseconds)
    const disableUntil = Date.now() + 5 * 60 * 1000;
    setConfirmationDisabledUntil(disableUntil);
    localStorage.setItem('confirmationDisabledUntil', disableUntil.toString());
    
    console.log("Confirmation disabled for 5 minutes");
    setShowDeleteConfirmation(false);
    setPendingDeleteMessageId(null);
  };

  // Helper function to get remaining time
  const getRemainingTime = () => {
    if (!confirmationDisabledUntil) return null;
    const now = Date.now();
    const remaining = confirmationDisabledUntil - now;
    if (remaining <= 0) return null;
    
    const minutes = Math.floor(remaining / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleUpdateBotProfile = async (updates: {
    username?: string;
    avatar?: string;
  }) => {
    try {
      await updateProfile(updates);
      // Refetch profile to get updated information
      await refetch();
      // Also refetch bot info for preview update
      refetchBotInfo();
    } catch (err) {
      console.error("Failed to update bot profile:", err);
      throw err;
    }
  };

  const handlePayloadChange = (payload: WebhookPayload) => {
    setLocalPayload(payload);
  };

  const handleSave = useCallback(async () => {
    if (!selectedChannelId) return;

    setSaveStatus("saving");
    setSaveError(null);

    // Use Zod validators for comprehensive validation
    const validationErrors = validatePayload(localPayload);

    if (validationErrors.length > 0) {
      setSaveStatus("error");
      setSaveError(
        validationErrors
          .slice(0, 3)
          .map((e) => `${e.path}: ${e.message}`)
          .join(" "),
      );
      return;
    }

    // Additional validation for empty content
    const contentLength = (localPayload.content ?? "").length;
    const hasAnyEmbedContent = localPayload.embeds.some((e) => {
      const hasFields = (e.fields ?? []).some(
        (f) => (f.name ?? "").trim() && (f.value ?? "").trim(),
      );
      return Boolean(
        (e.title ?? "").trim() ||
        (e.description ?? "").trim() ||
        (e.author?.name ?? "").trim() ||
        (e.footer?.text ?? "").trim() ||
        (e.image?.url ?? "").trim() ||
        (e.thumbnail?.url ?? "").trim() ||
        hasFields,
      );
    });

    if (!contentLength && !hasAnyEmbedContent) {
      setSaveStatus("error");
      setSaveError("Nothing to send. Add message content or embed content.");
      return;
    }

    const isValidUrl = (url: string | undefined) => {
      if (!url) return false;
      try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    };

    const embedsToSend = localPayload.embeds.map((embed) => ({
      title: embed.title || undefined,
      description: embed.description || undefined,
      url: isValidUrl(embed.url) ? embed.url : undefined,
      color: embed.color,
      author: embed.author?.name
        ? {
            ...embed.author,
            url: isValidUrl(embed.author.url) ? embed.author.url : undefined,
            icon_url: isValidUrl(embed.author.icon_url)
              ? embed.author.icon_url
              : undefined,
          }
        : undefined,
      footer: embed.footer?.text
        ? {
            ...embed.footer,
            icon_url: isValidUrl(embed.footer.icon_url)
              ? embed.footer.icon_url
              : undefined,
          }
        : undefined,
      thumbnail: isValidUrl(embed.thumbnail?.url) ? embed.thumbnail : undefined,
      image: isValidUrl(embed.image?.url) ? embed.image : undefined,
      fields: embed.fields
        ?.filter((f) => f.name && f.value)
        .map((f) => ({
          name: f.name,
          value: f.value,
          inline: f.inline ?? false,
        })),
      timestamp: embed.timestamp || undefined,
    }));

    try {
      if (selectedMessageId) {
        const oldId = selectedMessageId;
        const created = await sendMessage(selectedChannelId, {
          content: localPayload.content || undefined,
          embeds: embedsToSend,
        });
        selectMessage(created.id);
        setIsEditing(true);
        await deleteMessage(oldId, selectedChannelId, true);
      } else {
        const created = await sendMessage(selectedChannelId, {
          content: localPayload.content || undefined,
          embeds: embedsToSend,
        });

        // Newly posted project becomes the selected one so future "Update" edits it.
        selectMessage(created.id);
        setIsEditing(true);
      }
      // Preserve selection so the selected project doesn't reset after refresh.
      await fetchMessages(selectedChannelId, true, true);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to save:", err);
      setSaveStatus("error");
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    }
  }, [
    selectedChannelId,
    localPayload,
    selectedMessageId,
    sendMessage,
    deleteMessage,
    fetchMessages,
    selectMessage,
    setIsEditing,
  ]);

  const loading = guildsLoading || messagesLoading;

  return (
    <ErrorBoundary>
      <Layout
        sidebar={
          <ChannelsSidebar
            status={status}
            error={error}
            channels={channels}
            selectedChannelId={selectedChannelId}
            selectedGuildId={selectedGuildId}
            messages={messages}
            selectedMessageId={selectedMessageId}
            loading={loading}
            onConnect={connect}
            onDisconnect={disconnect}
            onSelectChannel={handleSelectChannel}
            onSelectMessage={selectMessage}
            onNewEmbed={handleNewEmbed}
            onDeleteProject={handleDeleteProject}
            onRefresh={refresh}
            selectGuild={selectGuild}
          />
        }
        editor={
          <EmbedEditor
            payload={localPayload}
            onChange={handlePayloadChange}
            projectName={isEditing ? "Edit Project" : "New Project"}
            onNameChange={() => {}}
            onSave={selectedChannelId ? handleSave : undefined}
            saveLabel={isEditing ? "Update on Discord" : "Send to Discord"}
            saveStatus={saveStatus}
            saveError={saveError}
          />
        }
        preview={<EmbedPreview payload={localPayload} botInfo={botInfo} />}
      />
      <BotProfileEditor
        isOpen={showBotProfileEditor}
        onClose={() => setShowBotProfileEditor(false)}
        currentProfile={profile}
        onUpdate={handleUpdateBotProfile}
      />
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        message="Delete this project from Discord?"
        onConfirm={confirmDeleteProject}
        onCancel={cancelDeleteProject}
        onAdditionalAction={handleAdditionalAction}
        additionalButtonText={getRemainingTime() ? `Disable (${getRemainingTime()})` : "Disable for 5 min"}
      />
    </ErrorBoundary>
  );
}
