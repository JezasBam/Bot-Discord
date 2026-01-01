import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import type { Embed } from "../types";
import { DISCORD_LIMITS } from "../types";
import { EmbedFieldsEditor } from "./EmbedFieldsEditor";
import { ColorPicker } from "./ColorPicker";
import { clsx } from "clsx";

interface EmbedSectionProps {
  _embed: Embed;
  index: number;
  total: number;
  onChange: (_embed: Embed) => void;
  onRemove: () => void;
  onMove: (_direction: "up" | "down") => void;
}

export function EmbedSection({
  _embed,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: EmbedSectionProps) {
  const [expanded, setExpanded] = useState(true);

  type SectionKey =
    | "author"
    | "body"
    | "fields"
    | "images"
    | "footer"
    | "timestamp";
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    author: false,
    body: true,
    fields: true,
    images: false,
    footer: false,
    timestamp: false,
  });

  const toggleSection = (key: SectionKey) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const _embedCharCount = (() => {
    const title = _embed.title?.length ?? 0;
    const description = _embed.description?.length ?? 0;
    const author = _embed.author?.name?.length ?? 0;
    const footer = _embed.footer?.text?.length ?? 0;
    const fieldChars = (_embed.fields ?? []).reduce(
      (sum, f) => sum + (f.name?.length ?? 0) + (f.value?.length ?? 0),
      0,
    );
    return title + description + author + footer + fieldChars;
  })();

  const _embedCharCountClass =
    _embedCharCount > DISCORD_LIMITS.EMBED_TOTAL_CHARS_MAX
      ? "text-discord-red"
      : "text-discord-muted";

  const updateField = <K extends keyof Embed>(key: K, value: Embed[K]) => {
    onChange({ ..._embed, [key]: value });
  };

  return (
    <section className="bg-discord-dark rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 bg-discord-lighter cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          <span className="font-medium">
            Embed {index + 1}
            {_embed.title && (
              <span className="text-discord-muted ml-2">— {_embed.title}</span>
            )}
          </span>
          <span className={clsx("text-xs ml-2", _embedCharCountClass)}>
            ({_embedCharCount}/{DISCORD_LIMITS.EMBED_TOTAL_CHARS_MAX})
          </span>
        </div>
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onMove("up")}
            disabled={index === 0}
            className="p-1.5 hover:bg-discord-light rounded disabled:opacity-30"
            title="Move up"
          >
            <ArrowUp size={16} />
          </button>
          <button
            onClick={() => onMove("down")}
            disabled={index === total - 1}
            className="p-1.5 hover:bg-discord-light rounded disabled:opacity-30"
            title="Move down"
          >
            <ArrowDown size={16} />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 hover:bg-discord-red rounded ml-2"
            title="Remove _embed"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={clsx("p-4 space-y-4", !expanded && "hidden")}>
        <div className="bg-discord-darker rounded">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-left"
            onClick={() => toggleSection("author")}
          >
            <span className="font-medium text-discord-text">Author</span>
            {sections.author ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          <div className={clsx("px-3 pb-3", !sections.author && "hidden")}>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={_embed.author?.name ?? ""}
                onChange={(e) =>
                  updateField("author", {
                    ..._embed.author,
                    name: e.target.value,
                  })
                }
                className="input"
                placeholder="Author name (ex: 'Server Bot', 'System')"
                maxLength={DISCORD_LIMITS.EMBED_AUTHOR_NAME_MAX}
              />
              <input
                type="url"
                value={_embed.author?.url ?? ""}
                onChange={(e) =>
                  updateField("author", {
                    ..._embed.author,
                    name: _embed.author?.name ?? "",
                    url: e.target.value,
                  })
                }
                className="input"
                placeholder="URL (ex: https://discord.com/invite)"
              />
              <input
                type="url"
                value={_embed.author?.icon_url ?? ""}
                onChange={(e) =>
                  updateField("author", {
                    ..._embed.author,
                    name: _embed.author?.name ?? "",
                    icon_url: e.target.value,
                  })
                }
                className="input"
                placeholder="Icon URL (ex: https://example.com/icon.png)"
              />
            </div>
          </div>
        </div>

        <div className="bg-discord-darker rounded">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-left"
            onClick={() => toggleSection("body")}
          >
            <span className="font-medium text-discord-text">Body</span>
            {sections.body ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          <div
            className={clsx("px-3 pb-3 space-y-3", !sections.body && "hidden")}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={_embed.title ?? ""}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="input"
                  placeholder="Embed title (ex: 'Welcome!', 'Server Rules')"
                  maxLength={DISCORD_LIMITS.EMBED_TITLE_MAX}
                />
              </div>
              <div>
                <label className="label">Title URL</label>
                <input
                  type="url"
                  value={_embed.url ?? ""}
                  onChange={(e) => updateField("url", e.target.value)}
                  className="input"
                  placeholder="Title URL (ex: https://example.com/banner.png)"
                />
              </div>
            </div>

            <div>
              <label className="label">
                Description
                <span className="text-discord-muted ml-2">
                  ({(_embed.description ?? "").length}/
                  {DISCORD_LIMITS.EMBED_DESCRIPTION_MAX})
                </span>
              </label>
              <textarea
                value={_embed.description ?? ""}
                onChange={(e) => updateField("description", e.target.value)}
                className="input resize-y"
                rows={4}
                placeholder="Embed description (ex: 'Server rules and guidelines')"
                maxLength={DISCORD_LIMITS.EMBED_DESCRIPTION_MAX}
              />
            </div>

            <ColorPicker
              _color={_embed.color ?? 5793266}
              onChange={(color) => updateField("color", color)}
            />
          </div>
        </div>

        <div className="bg-discord-darker rounded">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-left"
            onClick={() => toggleSection("fields")}
          >
            <span className="font-medium text-discord-text">Fields</span>
            {sections.fields ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          <div className={clsx("px-3 pb-3", !sections.fields && "hidden")}>
            <EmbedFieldsEditor
              _fields={_embed.fields ?? []}
              onChange={(fields) => updateField("fields", fields)}
            />
          </div>
        </div>

        <div className="bg-discord-darker rounded">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-left"
            onClick={() => toggleSection("images")}
          >
            <span className="font-medium text-discord-text">Images</span>
            {sections.images ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          <div className={clsx("px-3 pb-3", !sections.images && "hidden")}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Image URL</label>
                <input
                  type="url"
                  value={_embed.image?.url ?? ""}
                  onChange={(e) =>
                    updateField(
                      "image",
                      e.target.value ? { url: e.target.value } : undefined,
                    )
                  }
                  className="input"
                  placeholder="Title URL (ex: https://example.com/banner.png)"
                />
              </div>
              <div>
                <label className="label">Thumbnail URL</label>
                <input
                  type="url"
                  value={_embed.thumbnail?.url ?? ""}
                  onChange={(e) =>
                    updateField(
                      "thumbnail",
                      e.target.value ? { url: e.target.value } : undefined,
                    )
                  }
                  className="input"
                  placeholder="Title URL (ex: https://example.com/banner.png)"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-discord-darker rounded">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-left"
            onClick={() => toggleSection("footer")}
          >
            <span className="font-medium text-discord-text">Footer</span>
            {sections.footer ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          <div className={clsx("px-3 pb-3", !sections.footer && "hidden")}>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={_embed.footer?.text ?? ""}
                onChange={(e) =>
                  updateField("footer", {
                    ..._embed.footer,
                    text: e.target.value,
                  })
                }
                className="input"
                placeholder="Footer text (ex: '© 2024 Server Bot')"
                maxLength={DISCORD_LIMITS.EMBED_FOOTER_TEXT_MAX}
              />
              <input
                type="url"
                value={_embed.footer?.icon_url ?? ""}
                onChange={(e) =>
                  updateField("footer", {
                    text: _embed.footer?.text ?? "",
                    icon_url: e.target.value,
                  })
                }
                className="input"
                placeholder="Footer icon URL (ex: https://example.com/footer-icon.png)"
              />
            </div>
          </div>
        </div>

        <div className="bg-discord-darker rounded">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-left"
            onClick={() => toggleSection("timestamp")}
          >
            <span className="font-medium text-discord-text">Timestamp</span>
            {sections.timestamp ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          <div className={clsx("px-3 pb-3", !sections.timestamp && "hidden")}>
            <input
              type="datetime-local"
              value={_embed.timestamp ? _embed.timestamp.slice(0, 16) : ""}
              onChange={(e) =>
                updateField(
                  "timestamp",
                  e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                )
              }
              className="input"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
