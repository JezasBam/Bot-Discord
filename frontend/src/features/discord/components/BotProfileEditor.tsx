import { useState, useEffect } from "react";
import { Settings, Upload, Save, X } from "lucide-react";

export interface BotProfile {
  id: string;
  username: string;
  tag: string;
  avatarUrl: string;
}

interface BotProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: BotProfile | null;
  onUpdate: (_profile: { username?: string; avatar?: string }) => Promise<void>;
}

export function BotProfileEditor({
  isOpen,
  onClose,
  currentProfile: _currentProfile,
  onUpdate,
}: BotProfileEditorProps) {
  const [username, setUsername] = useState(_currentProfile?.username || "");
  const [avatarPreview, setAvatarPreview] = useState(
    _currentProfile?.avatarUrl || "",
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameWarning, setUsernameWarning] = useState<string | null>(null);
  const [lastUsernameChange, setLastUsernameChange] = useState<number | null>(
    null,
  );
  const [cooldownTime, setCooldownTime] = useState(0);

  // Validate username in real-time
  const validateUsername = (value: string) => {
    if (!value.trim()) {
      setUsernameWarning(null);
      return;
    }

    // Check for common names that might be taken
    const commonNames = [
      "Protectorul",
      "Guardian",
      "Defender",
      "Hero",
      "Champion",
      "Warrior",
      "Knight",
    ];
    const isCommon = commonNames.some((common) =>
      value.toLowerCase().includes(common.toLowerCase()),
    );

    if (isCommon && value.length < 10) {
      setUsernameWarning(
        "Acest nume este prea comun. Adaugă cifre sau sufixe pentru a fi unic.",
      );
    } else if (value.length < 3) {
      setUsernameWarning("Numele trebuie să aibă cel puțin 3 caractere.");
    } else {
      setUsernameWarning(null);
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    validateUsername(value);
    setError(null);
  };

  // Cooldown timer for username changes
  useEffect(() => {
    // Check for existing cooldown from localStorage
    const storedLimit = localStorage.getItem("usernameRateLimit");
    if (storedLimit) {
      const limitTime = parseInt(storedLimit);
      const now = Date.now();

      if (limitTime > now) {
        const remainingCooldown = Math.ceil((limitTime - now) / 1000);
        setCooldownTime(remainingCooldown);
        setLastUsernameChange(limitTime - 5 * 60 * 1000); // Set to 5 minutes ago
      } else {
        // Clear expired limit
        localStorage.removeItem("usernameRateLimit");
      }
    }

    if (lastUsernameChange) {
      const timeSinceLastChange = Date.now() - lastUsernameChange;
      const remainingCooldown = Math.max(
        0,
        5 * 60 * 1000 - timeSinceLastChange,
      ); // 5 minutes

      if (remainingCooldown > 0) {
        setCooldownTime(Math.ceil(remainingCooldown / 1000));

        const timer = setInterval(() => {
          setCooldownTime((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              localStorage.removeItem("usernameRateLimit");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } else {
        setCooldownTime(0);
      }
    }
  }, [lastUsernameChange]);

  const handleSave = async () => {
    // Check cooldown
    if (cooldownTime > 0) {
      setError(
        `Așteaptă ${cooldownTime} secunde înainte de a schimba numele din nou.`,
      );
      return;
    }

    // Additional check for localStorage cooldown
    const storedLimit = localStorage.getItem("usernameRateLimit");
    if (storedLimit) {
      const limitTime = parseInt(storedLimit);
      const now = Date.now();

      if (limitTime > now) {
        const remainingCooldown = Math.ceil((limitTime - now) / 1000);
        setCooldownTime(remainingCooldown);
        setLastUsernameChange(limitTime - 600 * 1000); // Set to 10 minutes ago
        setError(
          `Așteaptă ${remainingCooldown} secunde înainte de a schimba numele din nou.`,
        );
        return;
      }
    }

    // Check if username is too common
    if (usernameWarning && usernameWarning.includes("prea comun")) {
      setError("Alege un nume mai unic. Vezi sugestiile de mai jos.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updateData: { username?: string; avatar?: string } = {};

      if (username.trim() && username !== _currentProfile?.username) {
        updateData.username = username.trim();
        setLastUsernameChange(Date.now()); // Start cooldown after successful save
      }

      if (avatarFile) {
        updateData.avatar = avatarPreview;
      }

      if (Object.keys(updateData).length === 0) {
        setError("No changes to save");
        setIsSaving(false);
        return;
      }

      await onUpdate(updateData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");

      // If it's a rate limit error, set cooldown
      if (err instanceof Error && err.message.includes("prea repede")) {
        setLastUsernameChange(Date.now());
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Removed size limit - backend will handle compression
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleReset = () => {
    setUsername(_currentProfile?.username || "");
    setAvatarPreview(_currentProfile?.avatarUrl || "");
    setAvatarFile(null);
    setError(null);
    setUsernameWarning(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-discord-darker rounded-lg shadow-xl w-full max-w-md mx-4 border border-discord-light font-discord">
        <div className="flex items-center justify-between p-6 border-b border-discord-light">
          <h2 className="text-xl font-semibold text-discord-text flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Edit Bot Profile
          </h2>
          <button
            onClick={onClose}
            className="text-discord-muted hover:text-discord-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Profile Display */}
          {_currentProfile && (
            <div className="bg-discord-light rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-16 rounded-full bg-discord-darker overflow-hidden flex-shrink-0">
                  {_currentProfile.avatarUrl ? (
                    <img
                      src={_currentProfile.avatarUrl}
                      alt="Current bot avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-discord-muted">
                      <Settings className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-discord-text truncate">
                    {_currentProfile.username}
                    {_currentProfile.tag && (
                      <span className="text-discord-muted ml-1">
                        #{_currentProfile.tag}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-discord-muted">
                    Current Profile
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Section */}
          <div className="border-t border-discord-light pt-6">
            <h3 className="text-lg font-semibold text-discord-text mb-4">
              Edit Profile
            </h3>

            {/* Avatar Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-discord-muted">
                Avatar
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-discord-light overflow-hidden flex-shrink-0">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Bot avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-discord-muted">
                      <Upload className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block w-full text-sm text-discord-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-discord-blurple file:text-white hover:file:bg-opacity-80"
                  />
                  <p className="text-xs text-discord-muted mt-1">
                    PNG, JPG (any size - auto-compressed)
                  </p>
                </div>
              </div>
            </div>

            {/* Username Section */}
            <div className="space-y-3">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-discord-muted"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                maxLength={32}
                className="input"
                placeholder="Enter bot username"
              />
              <p className="text-xs text-discord-muted">
                {username.length}/32 characters
              </p>

              {/* Username suggestions */}
              {usernameWarning && usernameWarning.includes("prea comun") && (
                <div className="bg-discord-darker border border-discord-blurple rounded-md p-3">
                  <p className="text-xs text-discord-blurple font-medium mb-2">
                    Sugestii de nume unice:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "ProtectorulBot",
                      "Protectorul2025",
                      "ProtectorulRO",
                      "ProtectorulOfficial",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleUsernameChange(suggestion)}
                        className="text-xs bg-discord-blurple text-white px-2 py-1 rounded hover:bg-opacity-80 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {usernameWarning && !usernameWarning.includes("prea comun") && (
                <div className="bg-discord-darker border border-discord-yellow rounded-md p-2">
                  <p className="text-xs text-discord-yellow">
                    {usernameWarning}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-discord-darker border border-discord-red rounded-md p-3">
              <p className="text-sm text-discord-red">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-discord-light">
            <button onClick={handleReset} className="btn btn-secondary flex-1">
              Reset
            </button>
            <button onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                isSaving ||
                cooldownTime > 0 ||
                Boolean(
                  usernameWarning && usernameWarning.includes("prea comun"),
                )
              }
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : cooldownTime > 0 ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Wait {cooldownTime}s
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
