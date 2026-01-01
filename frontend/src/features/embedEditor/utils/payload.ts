import type { WebhookPayload, Embed } from "../types";

export function createEmptyPayload(): WebhookPayload {
  return {
    content: "",
    username: "",
    avatar_url: "",
    embeds: [],
  };
}

export function createEmptyEmbed(): Embed {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    color: 5793266, // Discord blurple as default
    fields: [],
  };
}

export function cleanPayloadForExport(payload: WebhookPayload): WebhookPayload {
  const cleaned: WebhookPayload = {
    embeds: [],
  };

  if (payload.content?.trim()) {
    cleaned.content = payload.content;
  }
  if (payload.username?.trim()) {
    cleaned.username = payload.username;
  }
  if (payload.avatar_url?.trim()) {
    cleaned.avatar_url = payload.avatar_url;
  }

  cleaned.embeds = payload.embeds.map((embed) => {
    const cleanedEmbed: Embed = {
      id: embed.id, // Preserve the ID for React key stability
    };

    if (embed.title?.trim()) cleanedEmbed.title = embed.title;
    if (embed.description?.trim()) cleanedEmbed.description = embed.description;
    if (embed.url?.trim()) cleanedEmbed.url = embed.url;
    if (embed.color !== undefined) cleanedEmbed.color = embed.color;
    if (embed.timestamp) cleanedEmbed.timestamp = embed.timestamp;

    if (embed.author?.name?.trim()) {
      cleanedEmbed.author = { name: embed.author.name };
      if (embed.author.url?.trim()) cleanedEmbed.author.url = embed.author.url;
      if (embed.author.icon_url?.trim())
        cleanedEmbed.author.icon_url = embed.author.icon_url;
    }

    if (embed.footer?.text?.trim()) {
      cleanedEmbed.footer = { text: embed.footer.text };
      if (embed.footer.icon_url?.trim())
        cleanedEmbed.footer.icon_url = embed.footer.icon_url;
    }

    if (embed.image?.url?.trim()) {
      cleanedEmbed.image = { url: embed.image.url };
    }

    if (embed.thumbnail?.url?.trim()) {
      cleanedEmbed.thumbnail = { url: embed.thumbnail.url };
    }

    if (embed.fields && embed.fields.length > 0) {
      cleanedEmbed.fields = embed.fields.filter(
        (f) => f.name?.trim() && f.value?.trim(),
      );
    }

    return cleanedEmbed;
  });

  return cleaned;
}
