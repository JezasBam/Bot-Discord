export interface EmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
}

export interface EmbedFooter {
  text: string;
  icon_url?: string;
}

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedImage {
  url: string;
}

export interface EmbedThumbnail {
  url: string;
}

export interface Embed {
  id: string; // UUID for React key stability
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  author?: EmbedAuthor;
  footer?: EmbedFooter;
  image?: EmbedImage;
  thumbnail?: EmbedThumbnail;
  fields?: EmbedField[];
}

export interface WebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds: Embed[];
}

export const DISCORD_LIMITS = {
  CONTENT_MAX: 2000,
  USERNAME_MAX: 80,
  PROJECT_NAME_MAX: 100,
  EMBEDS_MAX: 10,
  EMBED_TITLE_MAX: 256,
  EMBED_DESCRIPTION_MAX: 4096,
  EMBED_FIELDS_MAX: 25,
  EMBED_FIELD_NAME_MAX: 256,
  EMBED_FIELD_VALUE_MAX: 1024,
  EMBED_FOOTER_TEXT_MAX: 2048,
  EMBED_AUTHOR_NAME_MAX: 256,
  EMBED_TOTAL_CHARS_MAX: 6000,
} as const;
