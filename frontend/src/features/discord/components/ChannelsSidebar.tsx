import { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronRight,
  Hash,
  Megaphone,
  Loader2,
  RefreshCw,
  MessageSquare,
  Plus,
  Trash2,
} from 'lucide-react';
import clsx from 'clsx';
import type { Guild, GuildChannels, Channel, DiscordMessage } from '@/api/client';
import type { ConnectionStatus } from '../hooks/useConnection';

interface ChannelsSidebarProps {
  status: ConnectionStatus;
  error: string | null;
  guilds: Guild[];
  selectedGuildId: string | null;
  channels: GuildChannels | null;
  selectedChannelId: string | null;
  messages: DiscordMessage[];
  selectedMessageId: string | null;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSelectGuild: (guildId: string | null) => void;
  onSelectChannel: (channelId: string) => void;
  onSelectMessage: (messageId: string | null) => void;
  onNewEmbed: () => void;
  onDeleteProject: (messageId: string) => void;
  onRefresh: () => void;
}

export function ChannelsSidebar({
  status,
  error,
  guilds,
  selectedGuildId,
  channels,
  selectedChannelId,
  messages,
  selectedMessageId,
  loading,
  onConnect,
  onDisconnect,
  onSelectGuild,
  onSelectChannel,
  onSelectMessage,
  onNewEmbed,
  onDeleteProject,
  onRefresh,
}: ChannelsSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string> | 'all'>('all');
  const [showMessages, setShowMessages] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      if (prev === 'all') {
        const allIds = new Set(channels?.categories.map((c) => c.id) || []);
        allIds.delete(categoryId);
        return allIds;
      }
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const isCategoryExpanded = (categoryId: string) => {
    return expandedCategories === 'all' || expandedCategories.has(categoryId);
  };

  // Auto-refresh channels every 30 seconds
  useEffect(() => {
    if (status !== 'connected') return;
    const interval = setInterval(() => {
      onRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [status, onRefresh]);

  const handleChannelClick = (channelId: string) => {
    onSelectChannel(channelId);
    setShowMessages(true);
  };

  const selectedGuild = guilds.find((g) => g.id === selectedGuildId);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-discord-light">
        <h2 className="text-lg font-bold text-discord-blurple mb-3">Discord</h2>

        {/* Connection Button */}
        {status === 'disconnected' && (
          <button
            onClick={onConnect}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <Wifi size={16} />
            Connect to Bot
          </button>
        )}

        {status === 'connecting' && (
          <button disabled className="btn btn-secondary w-full flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Connecting...
          </button>
        )}

        {status === 'connected' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-discord-green flex items-center gap-1">
                <Wifi size={14} />
                Connected
              </span>
              <button
                onClick={onDisconnect}
                className="text-xs text-discord-muted hover:text-discord-red"
              >
                Disconnect
              </button>
            </div>
            {guilds.length > 1 && (
              <select
                value={selectedGuildId || ''}
                onChange={(e) => onSelectGuild(e.target.value || null)}
                className="input w-full text-sm"
              >
                <option value="">Select server...</option>
                {guilds.map((guild) => (
                  <option key={guild.id} value={guild.id}>
                    {guild.name}
                  </option>
                ))}
              </select>
            )}
            {selectedGuild && guilds.length === 1 && (
              <div className="flex items-center gap-2">
                {selectedGuild.icon && (
                  <img
                    src={selectedGuild.icon}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-sm text-discord-text truncate">{selectedGuild.name}</span>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-2">
            <div className="text-sm text-discord-red flex items-center gap-1">
              <WifiOff size={14} />
              {error || 'Connection error'}
            </div>
            <button
              onClick={onConnect}
              className="btn btn-secondary w-full flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Channel List or Messages */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-discord-muted" />
          </div>
        )}

        {!loading && status === 'connected' && channels && !showMessages && (
          <div className="py-2">
            {/* Uncategorized channels */}
            {channels.uncategorized.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isSelected={channel.id === selectedChannelId}
                onClick={() => handleChannelClick(channel.id)}
              />
            ))}

            {/* Categories */}
            {channels.categories.map((category) => (
              <div key={category.id}>
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center gap-1 px-2 py-1 text-xs font-semibold text-discord-muted uppercase hover:text-discord-text"
                >
                  {isCategoryExpanded(category.id) ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )}
                  {category.name}
                </button>
                {isCategoryExpanded(category.id) &&
                  category.children.map((channel) => (
                    <ChannelItem
                      key={channel.id}
                      channel={channel}
                      isSelected={channel.id === selectedChannelId}
                      onClick={() => handleChannelClick(channel.id)}
                    />
                  ))}
              </div>
            ))}
          </div>
        )}

        {!loading && status === 'connected' && showMessages && selectedChannelId && (
          <div className="py-2">
            <button
              onClick={() => setShowMessages(false)}
              className="w-full px-4 py-2 text-sm text-discord-muted hover:text-discord-text flex items-center gap-2"
            >
              <ChevronLeft size={14} />
              Back to channels
            </button>

            <div className="px-4 py-2 border-b border-discord-light space-y-2">
              <button
                onClick={onNewEmbed}
                className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm"
              >
                <Plus size={14} />
                New Project
              </button>
              <button
                onClick={() => onSelectChannel(selectedChannelId!)}
                className="btn btn-secondary w-full flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw size={14} />
                Refresh Messages
              </button>
            </div>

            {messages.length === 0 ? (
              <p className="text-discord-muted text-sm text-center py-4">
                No messages with embeds
              </p>
            ) : (
              <div className="space-y-1 py-2">
                {messages.filter((m) => m.fromBot).map((message) => (
                  <button
                    key={message.id}
                    onClick={() => onSelectMessage(message.id)}
                    className={clsx(
                      'w-full px-4 py-2 text-left text-sm hover:bg-discord-light rounded mx-2',
                      message.id === selectedMessageId && 'bg-discord-light'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare size={14} className="text-discord-muted" />
                        <span className="truncate">
                          {message.embeds[0]?.title || message.content?.slice(0, 30) || 'Project'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(message.id);
                        }}
                        className="p-1.5 hover:bg-discord-red rounded"
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="text-xs text-discord-muted mt-1">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && status !== 'connected' && (
          <p className="text-discord-muted text-sm text-center py-8">
            Connect to see channels
          </p>
        )}
      </div>

      {/* Refresh */}
      {status === 'connected' && (
        <div className="p-2 border-t border-discord-light">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn btn-secondary w-full flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}

function ChannelItem({
  channel,
  isSelected,
  onClick,
}: {
  channel: Channel;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = channel.type === 5 ? Megaphone : Hash;

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-2 px-4 py-1.5 text-sm hover:bg-discord-light rounded mx-2',
        isSelected ? 'bg-discord-light text-discord-text' : 'text-discord-muted'
      )}
    >
      <Icon size={16} />
      <span className="truncate">{channel.name}</span>
    </button>
  );
}

function ChevronLeft({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
