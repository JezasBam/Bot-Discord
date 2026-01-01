import type { WebhookPayload, Embed } from "../types";
import { useState, useEffect } from "react";
import { MessageSection } from "./MessageSection";
import { EmbedSection } from "./EmbedSection";
import { Plus, Send, Loader2, Check, AlertCircle, Settings } from "lucide-react";
import { createEmptyEmbed } from "../utils/payload";
import { DISCORD_LIMITS } from "../types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface EmbedEditorProps {
  payload: WebhookPayload;
  onChange: (_payload: WebhookPayload) => void;
  projectName?: string;
  onNameChange?: (_name: string) => void;
  onSave?: () => void;
  saveLabel?: string;
  saveStatus?: "idle" | "saving" | "success" | "error";
  saveError?: string | null;
}

export function EmbedEditor({
  payload,
  onChange,
  projectName,
  onNameChange,
  onSave,
  saveLabel,
  saveStatus = "idle",
  saveError,
}: EmbedEditorProps) {
  const [projectExpanded, setProjectExpanded] = useState(true);
  const [disableEmbedDeleteConfirmation, setDisableEmbedDeleteConfirmation] = useState(() => {
    return localStorage.getItem('disableEmbedDeleteConfirmation') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('disableEmbedDeleteConfirmation', disableEmbedDeleteConfirmation.toString());
  }, [disableEmbedDeleteConfirmation]);

  const handleContentChange = (content: string) => {
    onChange({ ...payload, content });
  };

  const handleUsernameChange = (username: string) => {
    onChange({ ...payload, username });
  };

  const handleAvatarChange = (avatar_url: string) => {
    onChange({ ...payload, avatar_url });
  };

  const handleEmbedChange = (index: number, embed: Embed) => {
    const newEmbeds = [...payload.embeds];
    newEmbeds[index] = embed;
    onChange({ ...payload, embeds: newEmbeds });
  };

  const handleAddEmbed = () => {
    if (payload.embeds.length >= DISCORD_LIMITS.EMBEDS_MAX) return;
    onChange({ ...payload, embeds: [...payload.embeds, createEmptyEmbed()] });
  };

  const handleRemoveEmbed = (index: number) => {
    if (!disableEmbedDeleteConfirmation) {
      const confirmed = window.confirm("Are you sure you want to delete this embed?");
      if (!confirmed) return;
    }
    const newEmbeds = payload.embeds.filter((_, i) => i !== index);
    onChange({ ...payload, embeds: newEmbeds });
  };

  const handleMoveEmbed = (index: number, direction: "up" | "down") => {
    const newEmbeds = [...payload.embeds];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newEmbeds.length) return;
    [newEmbeds[index], newEmbeds[targetIndex]] = [
      newEmbeds[targetIndex]!,
      newEmbeds[index]!,
    ];
    onChange({ ...payload, embeds: newEmbeds });
  };

  return (
    <div className="space-y-6 max-w-2xl pb-20">
      {/* Project + Message */}
      <section className="bg-discord-dark rounded-lg overflow-hidden">
        <div
          className="flex items-center justify-between p-3 bg-discord-lighter cursor-pointer"
          onClick={() => setProjectExpanded(!projectExpanded)}
        >
          <div className="flex items-center gap-2">
            {projectExpanded ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
            <span className="font-medium">Project</span>
          </div>
        </div>

        {projectExpanded && (
          <div className="p-4 space-y-6">
            {onNameChange && (
              <div>
                <div className="text-discord-muted mb-2">
                  {projectName && <span>— {projectName}</span>}
                  <span className={projectName ? "ml-2" : ""}>
                    ({(projectName ?? "").length}/
                    {DISCORD_LIMITS.PROJECT_NAME_MAX})
                  </span>
                </div>
                <input
                  type="text"
                  value={projectName ?? ""}
                  onChange={(e) => onNameChange(e.target.value)}
                  maxLength={DISCORD_LIMITS.PROJECT_NAME_MAX}
                  className="input text-lg font-semibold"
                  placeholder="Untitled (ex: 'Welcome Message', 'Server Rules')"
                />
              </div>
            )}

            <MessageSection
              variant="plain"
              content={payload.content ?? ""}
              username={payload.username ?? ""}
              avatarUrl={payload.avatar_url ?? ""}
              onContentChange={handleContentChange}
              onUsernameChange={handleUsernameChange}
              onAvatarChange={handleAvatarChange}
            />
          </div>
        )}
      </section>

      {/* Embeds */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-discord-text">
            Embeds ({payload.embeds.length}/{DISCORD_LIMITS.EMBEDS_MAX})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDisableEmbedDeleteConfirmation(!disableEmbedDeleteConfirmation)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                disableEmbedDeleteConfirmation 
                  ? 'bg-discord-red text-white hover:bg-discord-red/80' 
                  : 'bg-discord-light text-discord-text hover:bg-discord-lighter'
              }`}
              title={disableEmbedDeleteConfirmation ? "Enable delete confirmation" : "Disable delete confirmation"}
            >
              <Settings size={14} />
              {disableEmbedDeleteConfirmation ? "No Confirm" : "Confirm Delete"}
            </button>
            <button
              onClick={handleAddEmbed}
              disabled={payload.embeds.length >= DISCORD_LIMITS.EMBEDS_MAX}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Plus size={16} />
              Add Embed
            </button>
          </div>
        </div>

        {payload.embeds.map((embed, index) => (
          <EmbedSection
            key={embed.id}
            _embed={embed}
            index={index}
            total={payload.embeds.length}
            onChange={(updated) => handleEmbedChange(index, updated)}
            onRemove={() => handleRemoveEmbed(index)}
            onMove={(dir) => handleMoveEmbed(index, dir)}
          />
        ))}

        {payload.embeds.length === 0 && (
          <p className="text-discord-muted text-center py-8">
            No embeds yet. Click "Add Embed" to create one.
          </p>
        )}
      </div>

      {/* Save Button */}
      {onSave && (
        <div className="sticky bottom-0 pt-4 pb-4 border-t border-discord-light space-y-2 bg-discord-bg">
          <button
            onClick={onSave}
            disabled={saveStatus === "saving"}
            className={`btn w-full flex items-center justify-center gap-2 ${
              saveStatus === "success"
                ? "btn-success bg-discord-green"
                : saveStatus === "error"
                  ? "btn-error bg-discord-red"
                  : "btn-primary"
            }`}
          >
            {saveStatus === "saving" && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {saveStatus === "success" && <Check size={16} />}
            {saveStatus === "error" && <AlertCircle size={16} />}
            {saveStatus === "idle" && <Send size={16} />}
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "success"
                ? "Saved!"
                : saveStatus === "error"
                  ? "Error"
                  : saveLabel || "Save"}
          </button>
          {saveError && (
            <p className="text-discord-red text-sm text-center">{saveError}</p>
          )}
        </div>
      )}
    </div>
  );
}
