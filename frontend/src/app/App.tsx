import { useState, useEffect, useCallback } from 'react';
import { Layout } from './layout/Layout';
import { ChannelsSidebar } from '@/features/discord/components/ChannelsSidebar';
import { EmbedEditor } from '@/features/embedEditor/components/EmbedEditor';
import { EmbedPreview } from '@/features/embedEditor/preview/EmbedPreview';
import { useConnection } from '@/features/discord/hooks/useConnection';
import { useGuilds } from '@/features/discord/hooks/useGuilds';
import { useChannelMessages } from '@/features/discord/hooks/useChannelMessages';
import { useSocket } from '@/features/discord/hooks/useSocket';
import { DISCORD_LIMITS, type WebhookPayload, type Embed } from '@/features/embedEditor/types';
import { createEmptyPayload, createEmptyEmbed } from '@/features/embedEditor/utils/payload';
import type { MessageEmbed } from '@/api/client';

function convertDiscordEmbed(embed: MessageEmbed): Embed {
  return {
    title: embed.title,
    description: embed.description,
    url: embed.url,
    color: embed.color,
    author: embed.author?.name ? {
      name: embed.author.name,
      url: embed.author.url,
      icon_url: embed.author.icon_url,
    } : undefined,
    footer: embed.footer?.text ? {
      text: embed.footer.text,
      icon_url: embed.footer.icon_url,
    } : undefined,
    thumbnail: embed.thumbnail?.url ? { url: embed.thumbnail.url } : undefined,
    image: embed.image?.url ? { url: embed.image.url } : undefined,
    fields: embed.fields || [],
    timestamp: embed.timestamp,
  };
}

export default function App() {
  const { status, error, connect, disconnect, isConnected } = useConnection();
  const { guilds, selectedGuildId, channels, loading: guildsLoading, selectGuild, refresh, refreshChannels } = useGuilds(isConnected);
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

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [localPayload, setLocalPayload] = useState<WebhookPayload>(createEmptyPayload());
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleChannelUpdateFromSocket = useCallback(async () => {
    console.log('Socket: channels updated, refreshing...');
    await refreshChannels();
  }, [refreshChannels]);

  const handleMessageUpdateFromSocket = useCallback(() => {
    if (selectedChannelId) {
      console.log('Socket: messages updated, refreshing...');
      fetchMessages(selectedChannelId, true, true);
    }
  }, [selectedChannelId, fetchMessages]);

  useSocket(
    isConnected,
    selectedGuildId,
    selectedChannelId,
    handleChannelUpdateFromSocket,
    handleMessageUpdateFromSocket
  );

  useEffect(() => {
    if (selectedMessage) {
      setLocalPayload({
        content: selectedMessage.content || '',
        username: '',
        avatar_url: '',
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
    const confirmed = window.confirm('Delete this project from Discord?');
    if (!confirmed) return;

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
      console.error('Failed to delete project:', err);
      setSaveStatus('error');
      setSaveError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const handlePayloadChange = (payload: WebhookPayload) => {
    setLocalPayload(payload);
  };

  const handleSave = async () => {
    if (!selectedChannelId) return;

    setSaveStatus('saving');
    setSaveError(null);

    const validationErrors: string[] = [];

    const contentLength = (localPayload.content ?? '').length;
    if (contentLength > DISCORD_LIMITS.CONTENT_MAX) {
      validationErrors.push(`Message content is too long (${contentLength}/${DISCORD_LIMITS.CONTENT_MAX}).`);
    }

    if (localPayload.embeds.length > DISCORD_LIMITS.EMBEDS_MAX) {
      validationErrors.push(`Too many embeds (${localPayload.embeds.length}/${DISCORD_LIMITS.EMBEDS_MAX}).`);
    }

    const hasAnyEmbedContent = localPayload.embeds.some((e) => {
      const hasFields = (e.fields ?? []).some((f) => (f.name ?? '').trim() && (f.value ?? '').trim());
      return Boolean(
        (e.title ?? '').trim() ||
        (e.description ?? '').trim() ||
        (e.author?.name ?? '').trim() ||
        (e.footer?.text ?? '').trim() ||
        (e.image?.url ?? '').trim() ||
        (e.thumbnail?.url ?? '').trim() ||
        hasFields
      );
    });

    if (!contentLength && !hasAnyEmbedContent) {
      validationErrors.push('Nothing to send. Add message content or embed content.');
    }

    localPayload.embeds.forEach((e, i) => {
      const titleLen = (e.title ?? '').length;
      const descLen = (e.description ?? '').length;
      const authorLen = (e.author?.name ?? '').length;
      const footerLen = (e.footer?.text ?? '').length;

      if (titleLen > DISCORD_LIMITS.EMBED_TITLE_MAX) {
        validationErrors.push(`Embed ${i + 1}: title too long (${titleLen}/${DISCORD_LIMITS.EMBED_TITLE_MAX}).`);
      }
      if (descLen > DISCORD_LIMITS.EMBED_DESCRIPTION_MAX) {
        validationErrors.push(`Embed ${i + 1}: description too long (${descLen}/${DISCORD_LIMITS.EMBED_DESCRIPTION_MAX}).`);
      }
      if (authorLen > DISCORD_LIMITS.EMBED_AUTHOR_NAME_MAX) {
        validationErrors.push(`Embed ${i + 1}: author name too long (${authorLen}/${DISCORD_LIMITS.EMBED_AUTHOR_NAME_MAX}).`);
      }
      if (footerLen > DISCORD_LIMITS.EMBED_FOOTER_TEXT_MAX) {
        validationErrors.push(`Embed ${i + 1}: footer too long (${footerLen}/${DISCORD_LIMITS.EMBED_FOOTER_TEXT_MAX}).`);
      }

      const fields = e.fields ?? [];
      if (fields.length > DISCORD_LIMITS.EMBED_FIELDS_MAX) {
        validationErrors.push(`Embed ${i + 1}: too many fields (${fields.length}/${DISCORD_LIMITS.EMBED_FIELDS_MAX}).`);
      }

      fields.forEach((f, fi) => {
        const name = (f.name ?? '').trim();
        const value = (f.value ?? '').trim();
        const nameLen = name.length;
        const valueLen = value.length;

        if ((name && !value) || (!name && value)) {
          validationErrors.push(`Embed ${i + 1} field ${fi + 1}: name and value must both be set.`);
        }
        if (nameLen > DISCORD_LIMITS.EMBED_FIELD_NAME_MAX) {
          validationErrors.push(`Embed ${i + 1} field ${fi + 1}: name too long (${nameLen}/${DISCORD_LIMITS.EMBED_FIELD_NAME_MAX}).`);
        }
        if (valueLen > DISCORD_LIMITS.EMBED_FIELD_VALUE_MAX) {
          validationErrors.push(`Embed ${i + 1} field ${fi + 1}: value too long (${valueLen}/${DISCORD_LIMITS.EMBED_FIELD_VALUE_MAX}).`);
        }
      });

      const fieldChars = fields.reduce((sum, f) => sum + (f.name?.length ?? 0) + (f.value?.length ?? 0), 0);
      const totalChars = titleLen + descLen + authorLen + footerLen + fieldChars;
      if (totalChars > DISCORD_LIMITS.EMBED_TOTAL_CHARS_MAX) {
        validationErrors.push(`Embed ${i + 1}: total characters too high (${totalChars}/${DISCORD_LIMITS.EMBED_TOTAL_CHARS_MAX}).`);
      }
    });

    if (validationErrors.length) {
      setSaveStatus('error');
      setSaveError(validationErrors.slice(0, 3).join(' '));
      return;
    }

    const isValidUrl = (url: string | undefined) => {
      if (!url) return false;
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    };

    const embedsToSend = localPayload.embeds.map((embed) => ({
      title: embed.title || undefined,
      description: embed.description || undefined,
      url: isValidUrl(embed.url) ? embed.url : undefined,
      color: embed.color,
      author: embed.author?.name ? {
        ...embed.author,
        url: isValidUrl(embed.author.url) ? embed.author.url : undefined,
        icon_url: isValidUrl(embed.author.icon_url) ? embed.author.icon_url : undefined,
      } : undefined,
      footer: embed.footer?.text ? {
        ...embed.footer,
        icon_url: isValidUrl(embed.footer.icon_url) ? embed.footer.icon_url : undefined,
      } : undefined,
      thumbnail: isValidUrl(embed.thumbnail?.url) ? embed.thumbnail : undefined,
      image: isValidUrl(embed.image?.url) ? embed.image : undefined,
      fields: embed.fields?.filter((f) => f.name && f.value).map((f) => ({
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
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to save:', err);
      setSaveStatus('error');
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const loading = guildsLoading || messagesLoading;

  return (
    <Layout
      sidebar={
        <ChannelsSidebar
          status={status}
          error={error}
          guilds={guilds}
          selectedGuildId={selectedGuildId}
          channels={channels}
          selectedChannelId={selectedChannelId}
          messages={messages}
          selectedMessageId={selectedMessageId}
          loading={loading}
          onConnect={connect}
          onDisconnect={disconnect}
          onSelectGuild={selectGuild}
          onSelectChannel={handleSelectChannel}
          onSelectMessage={selectMessage}
          onNewEmbed={handleNewEmbed}
          onDeleteProject={handleDeleteProject}
          onRefresh={refresh}
        />
      }
      editor={
        <EmbedEditor
          payload={localPayload}
          onChange={handlePayloadChange}
          projectName={isEditing ? 'Edit Project' : 'New Project'}
          onNameChange={() => {}}
          onSave={selectedChannelId ? handleSave : undefined}
          saveLabel={isEditing ? 'Update on Discord' : 'Send to Discord'}
          saveStatus={saveStatus}
          saveError={saveError}
        />
      }
      preview={<EmbedPreview payload={localPayload} />}
    />
  );
}
