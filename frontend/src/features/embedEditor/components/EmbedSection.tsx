import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import type { Embed } from '../types';
import { DISCORD_LIMITS } from '../types';
import { EmbedFieldsEditor } from './EmbedFieldsEditor';
import { ColorPicker } from './ColorPicker';
import { clsx } from 'clsx';

interface EmbedSectionProps {
  embed: Embed;
  index: number;
  total: number;
  onChange: (embed: Embed) => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
}

export function EmbedSection({ embed, index, total, onChange, onRemove, onMove }: EmbedSectionProps) {
  const [expanded, setExpanded] = useState(true);

  type SectionKey = 'author' | 'body' | 'fields' | 'images' | 'footer' | 'timestamp';
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

  const embedCharCount = (() => {
    const title = embed.title?.length ?? 0;
    const description = embed.description?.length ?? 0;
    const author = embed.author?.name?.length ?? 0;
    const footer = embed.footer?.text?.length ?? 0;
    const fieldChars = (embed.fields ?? []).reduce((sum, f) => sum + (f.name?.length ?? 0) + (f.value?.length ?? 0), 0);
    return title + description + author + footer + fieldChars;
  })();

  const embedCharCountClass = embedCharCount > DISCORD_LIMITS.EMBED_TOTAL_CHARS_MAX ? 'text-discord-red' : 'text-discord-muted';

  const updateField = <K extends keyof Embed>(key: K, value: Embed[K]) => {
    onChange({ ...embed, [key]: value });
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
            {embed.title && <span className="text-discord-muted ml-2">— {embed.title}</span>}
          </span>
          <span className={clsx('text-xs ml-2', embedCharCountClass)}>
            ({embedCharCount}/{DISCORD_LIMITS.EMBED_TOTAL_CHARS_MAX})
          </span>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-1.5 hover:bg-discord-light rounded disabled:opacity-30"
            title="Move up"
          >
            <ArrowUp size={16} />
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={index === total - 1}
            className="p-1.5 hover:bg-discord-light rounded disabled:opacity-30"
            title="Move down"
          >
            <ArrowDown size={16} />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 hover:bg-discord-red rounded ml-2"
            title="Remove embed"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={clsx('p-4 space-y-4', !expanded && 'hidden')}>
        <div className="bg-discord-darker rounded">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-left"
            onClick={() => toggleSection('author')}
          >
            <span className="font-medium text-discord-text">Author</span>
            {sections.author ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className={clsx('px-3 pb-3', !sections.author && 'hidden')}>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={embed.author?.name ?? ''}
                onChange={(e) => updateField('author', { ...embed.author, name: e.target.value })}
                className="input"
                placeholder="Name"
                maxLength={DISCORD_LIMITS.EMBED_AUTHOR_NAME_MAX}
              />
              <input
                type="url"
                value={embed.author?.url ?? ''}
                onChange={(e) => updateField('author', { ...embed.author, name: embed.author?.name ?? '', url: e.target.value })}
                className="input"
                placeholder="URL"
              />
              <input
                type="url"
                value={embed.author?.icon_url ?? ''}
                onChange={(e) => updateField('author', { ...embed.author, name: embed.author?.name ?? '', icon_url: e.target.value })}
                className="input"
                placeholder="Icon URL"
              />
            </div>
          </div>
        </div>

        <div className="bg-discord-darker rounded">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-left"
            onClick={() => toggleSection('body')}
          >
            <span className="font-medium text-discord-text">Body</span>
            {sections.body ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className={clsx('px-3 pb-3 space-y-3', !sections.body && 'hidden')}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={embed.title ?? ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="input"
                  placeholder="Embed title"
                  maxLength={DISCORD_LIMITS.EMBED_TITLE_MAX}
                />
              </div>
              <div>
                <label className="label">Title URL</label>
                <input
                  type="url"
                  value={embed.url ?? ''}
                  onChange={(e) => updateField('url', e.target.value)}
                  className="input"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="label">
                Description
                <span className="text-discord-muted ml-2">
                  ({(embed.description ?? '').length}/{DISCORD_LIMITS.EMBED_DESCRIPTION_MAX})
                </span>
              </label>
              <textarea
                value={embed.description ?? ''}
                onChange={(e) => updateField('description', e.target.value)}
                className="input resize-y"
                rows={4}
                placeholder="Embed description..."
                maxLength={DISCORD_LIMITS.EMBED_DESCRIPTION_MAX}
              />
            </div>

            <ColorPicker color={embed.color ?? 5793266} onChange={(color) => updateField('color', color)} />
          </div>
        </div>

        <div className="bg-discord-darker rounded">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-left"
            onClick={() => toggleSection('fields')}
          >
            <span className="font-medium text-discord-text">Fields</span>
            {sections.fields ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className={clsx('px-3 pb-3', !sections.fields && 'hidden')}>
            <EmbedFieldsEditor fields={embed.fields ?? []} onChange={(fields) => updateField('fields', fields)} />
          </div>
        </div>

        <div className="bg-discord-darker rounded">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-left"
            onClick={() => toggleSection('images')}
          >
            <span className="font-medium text-discord-text">Images</span>
            {sections.images ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className={clsx('px-3 pb-3', !sections.images && 'hidden')}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Image URL</label>
                <input
                  type="url"
                  value={embed.image?.url ?? ''}
                  onChange={(e) => updateField('image', e.target.value ? { url: e.target.value } : undefined)}
                  className="input"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="label">Thumbnail URL</label>
                <input
                  type="url"
                  value={embed.thumbnail?.url ?? ''}
                  onChange={(e) => updateField('thumbnail', e.target.value ? { url: e.target.value } : undefined)}
                  className="input"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-discord-darker rounded">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-left"
            onClick={() => toggleSection('footer')}
          >
            <span className="font-medium text-discord-text">Footer</span>
            {sections.footer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className={clsx('px-3 pb-3', !sections.footer && 'hidden')}>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={embed.footer?.text ?? ''}
                onChange={(e) => updateField('footer', { ...embed.footer, text: e.target.value })}
                className="input"
                placeholder="Footer text"
                maxLength={DISCORD_LIMITS.EMBED_FOOTER_TEXT_MAX}
              />
              <input
                type="url"
                value={embed.footer?.icon_url ?? ''}
                onChange={(e) => updateField('footer', { text: embed.footer?.text ?? '', icon_url: e.target.value })}
                className="input"
                placeholder="Footer icon URL"
              />
            </div>
          </div>
        </div>

        <div className="bg-discord-darker rounded">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-left"
            onClick={() => toggleSection('timestamp')}
          >
            <span className="font-medium text-discord-text">Timestamp</span>
            {sections.timestamp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <div className={clsx('px-3 pb-3', !sections.timestamp && 'hidden')}>
            <input
              type="datetime-local"
              value={embed.timestamp ? embed.timestamp.slice(0, 16) : ''}
              onChange={(e) => updateField('timestamp', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
              className="input"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
