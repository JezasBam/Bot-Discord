import { z } from "zod";
import { DISCORD_LIMITS } from "./types";

const embedAuthorSchema = z.object({
  name: z.string().max(DISCORD_LIMITS.EMBED_AUTHOR_NAME_MAX),
  url: z.string().url().optional().or(z.literal("")),
  icon_url: z.string().url().optional().or(z.literal("")),
});

const embedFooterSchema = z.object({
  text: z.string().max(DISCORD_LIMITS.EMBED_FOOTER_TEXT_MAX),
  icon_url: z.string().url().optional().or(z.literal("")),
});

const embedFieldSchema = z.object({
  name: z.string().min(1).max(DISCORD_LIMITS.EMBED_FIELD_NAME_MAX),
  value: z.string().min(1).max(DISCORD_LIMITS.EMBED_FIELD_VALUE_MAX),
  inline: z.boolean().optional(),
});

const embedImageSchema = z.object({
  url: z.string().url(),
});

const embedThumbnailSchema = z.object({
  url: z.string().url(),
});

const embedSchema = z.object({
  title: z
    .string()
    .max(DISCORD_LIMITS.EMBED_TITLE_MAX)
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(DISCORD_LIMITS.EMBED_DESCRIPTION_MAX)
    .optional()
    .or(z.literal("")),
  url: z.string().url().optional().or(z.literal("")),
  color: z.number().int().min(0).max(16777215).optional(),
  timestamp: z.string().optional(),
  author: embedAuthorSchema.optional(),
  footer: embedFooterSchema.optional(),
  image: embedImageSchema.optional(),
  thumbnail: embedThumbnailSchema.optional(),
  fields: z
    .array(embedFieldSchema)
    .max(DISCORD_LIMITS.EMBED_FIELDS_MAX)
    .optional(),
});

export const webhookPayloadSchema = z.object({
  content: z
    .string()
    .max(DISCORD_LIMITS.CONTENT_MAX)
    .optional()
    .or(z.literal("")),
  username: z
    .string()
    .max(DISCORD_LIMITS.USERNAME_MAX)
    .optional()
    .or(z.literal("")),
  avatar_url: z.string().url().optional().or(z.literal("")),
  embeds: z.array(embedSchema).max(DISCORD_LIMITS.EMBEDS_MAX),
});

export type ValidationError = {
  path: string;
  message: string;
};

export function validatePayload(payload: unknown): ValidationError[] {
  const result = webhookPayloadSchema.safeParse(payload);
  if (result.success) {
    return [];
  }
  return result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}
