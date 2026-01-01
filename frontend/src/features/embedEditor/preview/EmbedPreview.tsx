import { useState, type ReactNode } from "react";
import { Copy, Check } from "lucide-react";
import type { WebhookPayload, Embed } from "../types";
import { type BotInfo } from "@/api/client";

interface EmbedPreviewProps {
  payload: WebhookPayload;
  botInfo: BotInfo | null;
}

export function EmbedPreview({ payload, botInfo }: EmbedPreviewProps) {
  const hasContent = payload.content?.trim();
  const hasEmbeds = payload.embeds.length > 0;
  const [copied, setCopied] = useState(false);

  const displayName = botInfo?.user?.username ?? "Bot";
  const avatarUrl = botInfo?.user?.avatarUrl ?? "";

  const handleCopyJson = async () => {
    try {
      const json = JSON.stringify(payload, null, 2);
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  if (!hasContent && !hasEmbeds) {
    return (
      <div className="text-discord-muted text-center py-12">
        <p>Preview will appear here</p>
        <p className="text-sm mt-1">Add content or embeds to see the preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="sticky top-0 z-10 bg-discord-bg pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-discord-text">Preview</h3>
          <button
            type="button"
            onClick={handleCopyJson}
            className="btn btn-secondary py-1 px-2 text-sm flex items-center gap-2"
            title="Copy payload JSON"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy JSON"}
          </button>
        </div>
      </div>

      {/* Message container */}
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://cdn.discordapp.com/embed/avatars/0.png";
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-discord-blurple flex items-center justify-center text-white font-semibold">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Username & timestamp */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-medium text-discord-text hover:underline cursor-pointer">
              {displayName}
            </span>
            <span className="text-xs text-discord-muted">
              Today at 12:00 PM
            </span>
          </div>

          {/* Message content */}
          {hasContent && (
            <p className="text-discord-text whitespace-pre-wrap break-words mb-2">
              {renderDiscordInlineMarkdown(payload.content ?? "")}
            </p>
          )}

          {/* Embeds */}
          {payload.embeds.map((embed, index) => (
            <EmbedCard key={index} embed={embed} />
          ))}
        </div>
      </div>
    </div>
  );
}

function EmbedCard({ embed }: { embed: Embed }) {
  const borderColor = embed.color
    ? `#${embed.color.toString(16).padStart(6, "0")}`
    : "#202225";

  return (
    <div
      className="max-w-[520px] rounded overflow-hidden mt-1"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="bg-[#2f3136] p-4">
        {/* Author */}
        {embed.author?.name && (
          <div className="flex items-center gap-2 mb-2">
            {embed.author.icon_url && (
              <img
                src={embed.author.icon_url}
                alt=""
                className="w-6 h-6 rounded-full"
              />
            )}
            {embed.author.url ? (
              <a
                href={embed.author.url}
                className="text-sm font-medium text-discord-text hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {renderDiscordInlineMarkdown(embed.author.name)}
              </a>
            ) : (
              <span className="text-sm font-medium text-discord-text">
                {renderDiscordInlineMarkdown(embed.author.name)}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        {embed.title && (
          <div className="mb-2">
            {embed.url ? (
              <a
                href={embed.url}
                className="font-semibold text-discord-link hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {renderDiscordInlineMarkdown(embed.title)}
              </a>
            ) : (
              <span className="font-semibold text-discord-text">
                {renderDiscordInlineMarkdown(embed.title)}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        {embed.description && (
          <p className="text-sm text-discord-text whitespace-pre-wrap break-words mb-2">
            {renderDiscordInlineMarkdown(embed.description)}
          </p>
        )}

        {/* Fields */}
        {embed.fields && embed.fields.length > 0 && (
          <div
            className="grid gap-2 mt-2"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            }}
          >
            {embed.fields.map((field, index) => (
              <div key={index} className={field.inline ? "" : "col-span-full"}>
                <div className="text-sm font-semibold text-discord-text">
                  {renderDiscordInlineMarkdown(field.name)}
                </div>
                <div className="text-sm text-discord-text whitespace-pre-wrap">
                  {renderDiscordInlineMarkdown(field.value)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image */}
        {embed.image?.url && (
          <img
            src={embed.image.url}
            alt=""
            className="max-w-full rounded mt-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        {/* Thumbnail (positioned absolutely in real Discord, simplified here) */}
        {embed.thumbnail?.url && !embed.image?.url && (
          <img
            src={embed.thumbnail.url}
            alt=""
            className="max-w-[80px] max-h-[80px] rounded mt-2"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        {/* Footer */}
        {(embed.footer?.text || embed.timestamp) && (
          <div className="flex items-center gap-2 mt-2 text-xs text-discord-muted">
            {embed.footer?.icon_url && (
              <img
                src={embed.footer.icon_url}
                alt=""
                className="w-5 h-5 rounded-full"
              />
            )}
            {embed.footer?.text && (
              <span>{renderDiscordInlineMarkdown(embed.footer.text)}</span>
            )}
            {embed.footer?.text && embed.timestamp && <span>•</span>}
            {embed.timestamp && (
              <span>{new Date(embed.timestamp).toLocaleDateString()}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function renderDiscordInlineMarkdown(text: string): ReactNode {
  const nodes = parseInline(text);
  return nodes.length === 1 ? nodes[0] : <>{nodes}</>;
}

function parseInline(text: string): ReactNode[] {
  let key = 0;
  const nextKey = () => `md-${key++}`;

  const splitCode = (input: string): ReactNode[] => {
    const out: ReactNode[] = [];
    let i = 0;
    while (i < input.length) {
      const start = input.indexOf("`", i);
      if (start === -1) {
        out.push(...splitFormatting(input.slice(i)));
        break;
      }
      const end = input.indexOf("`", start + 1);
      if (end === -1) {
        out.push(...splitFormatting(input.slice(i)));
        break;
      }

      if (start > i) {
        out.push(...splitFormatting(input.slice(i, start)));
      }

      const code = input.slice(start + 1, end);
      out.push(
        <code
          key={nextKey()}
          className="px-1 rounded bg-discord-bg text-discord-text"
        >
          {code}
        </code>,
      );
      i = end + 1;
    }
    return out;
  };

  const delimiters = ["***", "**", "__", "~~", "*", "_"] as const;

  const findNextDelimiter = (input: string) => {
    let bestIndex = -1;
    let bestDelim: (typeof delimiters)[number] | null = null;

    for (const d of delimiters) {
      const idx = input.indexOf(d);
      if (idx === -1) continue;
      if (
        bestIndex === -1 ||
        idx < bestIndex ||
        (idx === bestIndex && d.length > (bestDelim?.length ?? 0))
      ) {
        bestIndex = idx;
        bestDelim = d;
      }
    }
    return { index: bestIndex, delim: bestDelim };
  };

  const wrap = (delim: string, children: ReactNode[]) => {
    const keyProp = nextKey();
    if (delim === "***") {
      return (
        <strong key={keyProp}>
          <em>{children}</em>
        </strong>
      );
    }
    if (delim === "**") return <strong key={keyProp}>{children}</strong>;
    if (delim === "*") return <em key={keyProp}>{children}</em>;
    if (delim === "_") return <em key={keyProp}>{children}</em>;
    if (delim === "__") return <u key={keyProp}>{children}</u>;
    if (delim === "~~") return <s key={keyProp}>{children}</s>;
    return <span key={keyProp}>{children}</span>;
  };

  const splitFormatting = (input: string): ReactNode[] => {
    const out: ReactNode[] = [];
    let rest = input;

    while (rest.length > 0) {
      const { index, delim } = findNextDelimiter(rest);
      if (index === -1 || !delim) {
        out.push(rest);
        break;
      }

      if (index > 0) {
        out.push(rest.slice(0, index));
      }

      const start = index;
      const openLen = delim.length;
      const close = rest.indexOf(delim, start + openLen);
      if (close === -1) {
        out.push(rest.slice(start));
        break;
      }

      const innerRaw = rest.slice(start + openLen, close);
      out.push(wrap(delim, splitCode(innerRaw)));
      rest = rest.slice(close + openLen);
    }

    return out;
  };

  return splitCode(text);
}
