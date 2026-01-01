import { useState, useEffect } from "react";
import { ExternalLink, Loader2, XCircle, ChevronLeft, Server } from "lucide-react";

interface BotInvitePageProps {
  guildId: string;
  guildName: string;
  guildIcon?: string;
  onBack: () => void;
  onInviteSuccess: () => void;
}

export function BotInvitePage({ guildId, guildName, guildIcon, onBack, onInviteSuccess }: BotInvitePageProps) {
  const [inviteUrl, setInviteUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchInviteUrl();
  }, [guildId]);

  const fetchInviteUrl = async () => {
    try {
      setLoading(true);
      console.log(`🔗 Fetching invite URL for guild: ${guildName} (${guildId})`);
      
      const response = await fetch(`/api/guilds/${guildId}/invite`);
      
      if (response.ok) {
        const { inviteUrl } = await response.json();
        console.log("✅ Invite URL fetched successfully");
        setInviteUrl(inviteUrl);
      } else {
        throw new Error("Failed to fetch invite URL");
      }
    } catch (error) {
      console.error("❌ Error fetching invite URL:", error);
      setError("Failed to generate invite link");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteBot = async () => {
    if (!inviteUrl) return;
    
    setInviting(true);
    console.log("🔗 Opening invite URL...");
    window.open(inviteUrl, "_blank");
    
    // Start checking for bot presence every 3 seconds after invite
    setChecking(true);
    const checkInterval = setInterval(async () => {
      console.log("🔍 Checking if bot joined after invite...");
      try {
        const response = await fetch(`/api/guilds/${guildId}/channels`);
        if (response.ok) {
          console.log("✅ Bot has joined the server!");
          clearInterval(checkInterval);
          setChecking(false);
          setInviting(false);
          onInviteSuccess();
        }
      } catch (error) {
        console.log("⏳ Bot still not joined, checking again...");
      }
    }, 3000);
    
    // Stop checking after 2 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
      setChecking(false);
      setInviting(false);
      console.log("⏱️ Stopped auto-checking after 2 minutes");
    }, 120000);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={onBack} className="text-discord-muted hover:text-discord-text">
            <ChevronLeft size={16} />
          </button>
          <h3 className="text-lg font-semibold text-discord-text">Bot Invite</h3>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-discord-blurple mx-auto mb-4" />
            <p className="text-discord-muted">Preparing invite link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={onBack} className="text-discord-muted hover:text-discord-text">
            <ChevronLeft size={16} />
          </button>
          <h3 className="text-lg font-semibold text-discord-text">Bot Invite</h3>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <XCircle size={48} className="text-discord-red mx-auto mb-4" />
            <p className="text-discord-red mb-4">{error}</p>
            <button onClick={fetchInviteUrl} className="btn btn-secondary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={onBack} className="text-discord-muted hover:text-discord-text">
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-lg font-semibold text-discord-text">Bot Invite</h3>
      </div>
      
      <div className="flex-1 space-y-6">
        {/* Server Info */}
        <div className="bg-discord-light rounded-lg p-4">
          <div className="flex items-center gap-3">
            {guildIcon ? (
              <img
                src={`https://cdn.discordapp.com/icons/${guildId}/${guildIcon}.png`}
                alt=""
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-discord-darker flex items-center justify-center">
                <Server size={20} className="text-discord-muted" />
              </div>
            )}
            <div>
              <h4 className="font-semibold text-discord-text">{guildName}</h4>
              <p className="text-sm text-discord-muted">Server ID: {guildId}</p>
            </div>
          </div>
        </div>

        {/* Invite Status */}
        <div className="bg-discord-light rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <XCircle size={20} className="text-discord-red" />
            <span className="font-medium text-discord-red">Bot Not Present</span>
          </div>
          <p className="text-sm text-discord-muted mb-4">
            The bot needs to be added to this server to manage channels and embeds.
          </p>
          
          <button
            onClick={handleInviteBot}
            disabled={inviting || checking}
            className="w-full btn btn-primary flex items-center justify-center gap-2 py-3"
          >
            {inviting || checking ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {checking ? "Checking..." : "Inviting..."}
              </>
            ) : (
              <>
                <ExternalLink size={16} />
                Invite Bot to Server
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-discord-light rounded-lg p-4">
          <h5 className="font-medium text-discord-text mb-2">How it works:</h5>
          <ol className="text-sm text-discord-muted space-y-1 list-decimal list-inside">
            <li>Click "Invite Bot to Server" to open Discord</li>
            <li>Authorize the bot in Discord</li>
            <li>Bot will be automatically detected</li>
            <li>You'll be redirected back to manage channels</li>
          </ol>
        </div>

        {/* Checking Status */}
        {checking && (
          <div className="bg-discord-light rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-discord-blurple" />
              <span className="text-sm text-discord-text">
                Checking if bot joined the server...
              </span>
            </div>
            <p className="text-xs text-discord-muted mt-2">
              This will automatically continue for up to 2 minutes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
