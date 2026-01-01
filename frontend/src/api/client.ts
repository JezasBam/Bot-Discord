import { API_BASE } from "../config/env";

export interface Guild {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  ownerId?: string;
  isOwner?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  position: number;
  type: number;
  parentId: string | null;
}

export interface Category {
  id: string;
  name: string;
  position: number;
  type: "category";
  children: Channel[];
}

export interface GuildChannels {
  categories: Category[];
  uncategorized: Channel[];
}

export interface MessageEmbed {
  title?: string;
  description?: string;
  color?: number;
  author?: { name?: string; icon_url?: string; url?: string };
  footer?: { text?: string; icon_url?: string };
  thumbnail?: { url?: string };
  image?: { url?: string };
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: string;
  url?: string;
}

export interface DiscordMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar: string;
    bot: boolean;
  };
  embeds: MessageEmbed[];
  createdAt: string;
  editedAt?: string;
  pinned: boolean;
  fromBot: boolean;
}

export interface HealthCheck {
  status: string;
  botReady: boolean;
  guilds: number;
}

export interface BotInfo {
  botReady: boolean;
  user: {
    id: string;
    username: string;
    tag: string;
    avatarUrl: string;
  } | null;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      const message = error.details
        ? `${error.error}: ${error.details}`
        : error.error || `HTTP ${response.status}`;
      throw new Error(message);
    }

    return response.json();
  }

  async health(): Promise<HealthCheck> {
    return this.fetch("/health");
  }

  async bot(): Promise<BotInfo> {
    return this.fetch("/bot");
  }

  async getGuilds(): Promise<Guild[]> {
    return this.fetch("/guilds");
  }

  async getGuild(guildId: string): Promise<Guild> {
    return this.fetch(`/guilds/${guildId}`);
  }

  async getGuildChannels(guildId: string): Promise<GuildChannels> {
    return this.fetch(`/guilds/${guildId}/channels`);
  }

  async getChannelMessages(
    channelId: string,
    hasEmbeds?: boolean,
  ): Promise<DiscordMessage[]> {
    const params = new URLSearchParams();
    if (hasEmbeds) params.set("hasEmbeds", "true");
    const query = params.toString() ? `?${params}` : "";
    return this.fetch(`/channels/${channelId}/messages${query}`);
  }

  async sendMessage(
    channelId: string,
    payload: { content?: string; embeds?: MessageEmbed[] },
  ): Promise<DiscordMessage> {
    return this.fetch("/messages", {
      method: "POST",
      body: JSON.stringify({ channelId, ...payload }),
    });
  }

  async editMessage(
    messageId: string,
    channelId: string,
    payload: { content?: string; embeds?: MessageEmbed[] },
  ): Promise<DiscordMessage> {
    return this.fetch(`/messages/${messageId}`, {
      method: "PATCH",
      body: JSON.stringify({ channelId, ...payload }),
    });
  }

  async deleteMessage(messageId: string, channelId: string): Promise<void> {
    await this.fetch(`/messages/${messageId}?channelId=${channelId}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient();
