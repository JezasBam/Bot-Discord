import { useMemo, useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import type { EmbedField } from '../types';
import { DISCORD_LIMITS } from '../types';

interface EmbedFieldsEditorProps {
  fields: EmbedField[];
  onChange: (fields: EmbedField[]) => void;
}

export function EmbedFieldsEditor({ fields, onChange }: EmbedFieldsEditorProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Keep expanded map in sync with current indices.
    setExpanded((prev) => {
      const next: Record<number, boolean> = {};
      for (let i = 0; i < fields.length; i++) {
        next[i] = prev[i] ?? (fields.length <= 2);
      }
      return next;
    });
  }, [fields.length]);

  const toggleField = (index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !(prev[index] ?? true) }));
  };

  const handleAddField = () => {
    if (fields.length >= DISCORD_LIMITS.EMBED_FIELDS_MAX) return;
    onChange([...fields, { name: '', value: '', inline: false }]);
    setExpanded((prev) => ({ ...prev, [fields.length]: true }));
  };

  const handleRemoveField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const handleDuplicateField = (index: number) => {
    if (fields.length >= DISCORD_LIMITS.EMBED_FIELDS_MAX) return;
    const copy: EmbedField = {
      name: fields[index]?.name ?? '',
      value: fields[index]?.value ?? '',
      inline: fields[index]?.inline ?? false,
    };
    const next = [...fields.slice(0, index + 1), copy, ...fields.slice(index + 1)];
    onChange(next);
    setExpanded((prev) => ({ ...prev, [index + 1]: true }));
  };

  const handleFieldChange = (index: number, key: keyof EmbedField, value: string | boolean) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index]!, [key]: value };
    onChange(newFields);
  };

  const fieldsLabel = useMemo(() => {
    return `Fields (${fields.length}/${DISCORD_LIMITS.EMBED_FIELDS_MAX})`;
  }, [fields.length]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label mb-0">{fieldsLabel}</label>
        <button
          onClick={handleAddField}
          disabled={fields.length >= DISCORD_LIMITS.EMBED_FIELDS_MAX}
          className="btn btn-secondary py-1 px-2 text-sm flex items-center gap-1"
        >
          <Plus size={14} />
          Add Field
        </button>
      </div>

      {fields.length === 0 ? (
        <p className="text-discord-muted text-sm">No fields added yet.</p>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={index} className="bg-discord-darker rounded overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-discord-light"
                onClick={() => toggleField(index)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {expanded[index] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <span className="font-medium truncate">
                    Field {index + 1}
                    {field.name?.trim() ? <span className="text-discord-muted"> — {field.name}</span> : null}
                  </span>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <label className="flex items-center gap-2 text-sm text-discord-muted whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={field.inline ?? false}
                      onChange={(e) => handleFieldChange(index, 'inline', e.target.checked)}
                      className="rounded"
                    />
                    Inline
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDuplicateField(index)}
                    disabled={fields.length >= DISCORD_LIMITS.EMBED_FIELDS_MAX}
                    className="p-1.5 hover:bg-discord-light rounded disabled:opacity-40"
                    title="Duplicate field"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(index)}
                    className="p-1.5 hover:bg-discord-red rounded"
                    title="Remove field"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </button>

              <div className={expanded[index] ? 'px-3 pb-3 space-y-3' : 'hidden'}>
                <div className="flex items-start gap-2">
                  <GripVertical size={16} className="text-discord-muted mt-2 cursor-grab" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="label">
                        Name
                        <span className="text-discord-muted ml-2 italic">Required</span>
                        <span className="text-discord-muted ml-2">
                          {(field.name ?? '').length}/{DISCORD_LIMITS.EMBED_FIELD_NAME_MAX}
                        </span>
                      </label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                        className="input text-sm"
                        placeholder="Field name"
                        maxLength={DISCORD_LIMITS.EMBED_FIELD_NAME_MAX}
                      />
                    </div>

                    <div>
                      <label className="label">
                        Value
                        <span className="text-discord-muted ml-2 italic">Required</span>
                        <span className="text-discord-muted ml-2">
                          {(field.value ?? '').length}/{DISCORD_LIMITS.EMBED_FIELD_VALUE_MAX}
                        </span>
                      </label>
                      <textarea
                        value={field.value}
                        onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                        className="input text-sm resize-y"
                        placeholder="Field value"
                        maxLength={DISCORD_LIMITS.EMBED_FIELD_VALUE_MAX}
                        rows={5}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
