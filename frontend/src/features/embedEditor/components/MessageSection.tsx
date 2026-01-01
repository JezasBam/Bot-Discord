import { DISCORD_LIMITS } from "../types";

interface MessageSectionProps {
  content: string;
  username: string;
  avatarUrl: string;
  onContentChange: (_value: string) => void;
  onUsernameChange: (_value: string) => void;
  onAvatarChange: (_value: string) => void;
  variant?: "card" | "plain";
}

export function MessageSection({
  content,
  username,
  avatarUrl,
  onContentChange,
  onUsernameChange,
  onAvatarChange,
  variant = "card",
}: MessageSectionProps) {
  const wrapperClassName =
    variant === "plain"
      ? "space-y-4"
      : "bg-discord-dark rounded-lg p-4 space-y-4";

  return (
    <section className={wrapperClassName}>
      <h3 className="text-lg font-semibold text-discord-text">Message</h3>

      {/* Content */}
      <div>
        <label className="label">
          Content
          <span className="text-discord-muted ml-2">
            ({content.length}/{DISCORD_LIMITS.CONTENT_MAX})
          </span>
        </label>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          maxLength={DISCORD_LIMITS.CONTENT_MAX}
          rows={4}
          className="input resize-y"
          placeholder="Message content (ex: 'Hello @everyone!')"
        />
      </div>

      {/* Username & Avatar (side by side) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Username Override</label>
          <input
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            maxLength={DISCORD_LIMITS.USERNAME_MAX}
            className="input"
            placeholder="Webhook name (ex: 'Server Bot', 'Announcements')"
          />
        </div>
        <div>
          <label className="label">Avatar URL</label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => onAvatarChange(e.target.value)}
            className="input"
            placeholder="https://example.com/avatar.png (or leave empty for default)"
          />
        </div>
      </div>
    </section>
  );
}
