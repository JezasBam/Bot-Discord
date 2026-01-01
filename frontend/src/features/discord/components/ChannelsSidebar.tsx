import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Hash,
  Megaphone,
  Loader2,
  MessageSquare,
  Plus,
  Trash2,
  Server,
} from "lucide-react";
import clsx from "clsx";
import type {
  GuildChannels,
  Channel,
  DiscordMessage,
} from "@/api/client";
import type { ConnectionStatus } from "../hooks/useConnection";
import { AuthComponent } from "@/features/auth/components/AuthComponent";

interface ChannelsSidebarProps {
  status: ConnectionStatus;
  error: string | null;
  channels: GuildChannels | null;
  selectedChannelId: string | null;
  selectedGuildId: string | null;
  messages: DiscordMessage[];
  selectedMessageId: string | null;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSelectChannel: (_channelId: string) => void;
  onSelectMessage: (_messageId: string | null) => void;
  onNewEmbed: () => void;
  onDeleteProject: (_messageId: string) => void;
  onRefresh: () => void;
  selectGuild: (_guildId: string) => void;
}

export function ChannelsSidebar({
  status,
  channels,
  selectedChannelId,
  selectedGuildId,
  messages,
  selectedMessageId,
  loading,
  onConnect,
  onSelectChannel,
  onSelectMessage,
  onNewEmbed,
  onDeleteProject,
  onRefresh,
  selectGuild,
}: ChannelsSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<
    Set<string> | "all"
  >("all");
  const [showMessages, setShowMessages] = useState(false);
  const [showGuildList, setShowGuildList] = useState(true);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      if (prev === "all") {
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
    return expandedCategories === "all" || expandedCategories.has(categoryId);
  };

  // Auto-refresh channels every 30 seconds
  useEffect(() => {
    if (status !== "connected") return;
    const interval = setInterval(() => {
      onRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [status, onRefresh]);

  const handleChannelClick = (channelId: string) => {
    onSelectChannel(channelId);
    setShowMessages(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-discord-light">
        <h2 className="text-lg font-bold text-discord-blurple mb-3">Discord</h2>

        {/* User Authentication */}
        {!showGuildList && (
          <button
            onClick={() => setShowGuildList(true)}
            className="mb-3 text-xs text-discord-muted hover:text-discord-text flex items-center gap-1"
          >
            <ChevronLeft size={14} />
            Back to Servers
          </button>
        )}
        
        {showGuildList ? (
          <AuthComponent onGuildSelect={async (guildId) => {
            console.log("🎯 ChannelsSidebar received guild selection:", guildId);
            
            // Get guild info from localStorage
            const userGuilds = JSON.parse(localStorage.getItem('userGuilds') || '[]');
            const guild = userGuilds.find((g: any) => g.id === guildId);
            
            if (guild) {
              // Auto-connect bot if not connected
              if (status !== "connected") {
                console.log("🔗 Auto-connecting bot before guild selection...");
                await onConnect();
              }
              
              // Check bot presence BEFORE allowing access
              console.log(`🔍 Checking bot presence in guild: ${guildId}`);
              const response = await fetch(`/api/guilds/${guildId}/channels`);
              
              if (response.ok) {
                console.log("✅ Bot is present - allowing access");
                selectGuild(guildId);
                setShowGuildList(false); // Hide guild list and show channels
              } else if (response.status === 403 || response.status === 404) {
                console.log("❌ Bot is not present - opening invite in new tab");
                
                // Check if we're already inviting this guild
                const invitingGuild = localStorage.getItem('invitingGuild');
                if (invitingGuild === guildId) {
                  console.log("⚠️ Already inviting this guild, skipping...");
                  return;
                }
                
                // Generate invite URL and open in new tab
                const inviteResponse = await fetch(`/api/guilds/${guildId}/invite`);
                if (inviteResponse.ok) {
                  const { inviteUrl } = await inviteResponse.json();
                  console.log("🔗 Opening invite in new tab:", inviteUrl);
                  // Store that we're inviting to this guild
                  localStorage.setItem('invitingGuild', guildId);
                  window.open(inviteUrl, "_blank");
                }
              } else {
                console.log(`❌ Unexpected response status: ${response.status}`);
              }
            }
          }} />
        ) : (
          /* Guild-specific content when channels are shown */
          selectedGuildId && !showGuildList && (
            <div className="space-y-3">
              {/* Guild Header */}
              <div className="flex items-center gap-2 text-sm text-discord-muted">
                {(() => {
                  console.log('🎯 Rendering guild content for guildId:', selectedGuildId);
                  // Try to get guild info from the guilds that were fetched during auth
                  const userGuilds = JSON.parse(localStorage.getItem('userGuilds') || '[]');
                  const guild = userGuilds.find((g: any) => g.id === selectedGuildId);
                  return guild ? (
                    <>
                      {guild.icon ? (
                        <img
                          src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                          alt=""
                          className="w-5 h-5 rounded-full"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-discord-darker flex items-center justify-center">
                          <Server size={12} className="text-discord-muted" />
                        </div>
                      )}
                      <span className="text-discord-text font-medium">{guild.name}</span>
                    </>
                  ) : (
                    <span>Guild ID: {selectedGuildId}</span>
                  );
                })()}
              </div>
            </div>
          )
        )}
      </div>

      {/* Channel List or Messages */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-discord-muted" />
          </div>
        )}

        {!loading && status === "connected" && channels && !showMessages && !showGuildList && (
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

        {!loading &&
          status === "connected" &&
          showMessages &&
          selectedChannelId && (
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
              </div>

              {messages.length === 0 ? (
                <p className="text-discord-muted text-sm text-center py-4">
                  No messages with embeds
                </p>
              ) : (
                <div className="space-y-1 py-2">
                  {messages
                    .filter((m) => m.fromBot)
                    .map((message) => (
                      <button
                        key={message.id}
                        onClick={() => onSelectMessage(message.id)}
                        className={clsx(
                          "w-full px-4 py-2 text-left text-sm hover:bg-discord-light rounded mx-2",
                          message.id === selectedMessageId &&
                            "bg-discord-light",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <MessageSquare
                              size={14}
                              className="text-discord-muted"
                            />
                            <span className="truncate">
                              {message.embeds[0]?.title ||
                                message.content?.slice(0, 30) ||
                                "Project"}
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

        {!loading && status !== "connected" && (
          <p className="text-discord-muted text-sm text-center py-8">
            Connect to see channels
          </p>
        )}
      </div>
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
        "w-full flex items-center gap-2 px-4 py-1.5 text-sm hover:bg-discord-light rounded mx-2",
        isSelected
          ? "bg-discord-light text-discord-text"
          : "text-discord-muted",
      )}
    >
      <Icon size={16} />
      <span className="truncate">{channel.name}</span>
    </button>
  );
}
