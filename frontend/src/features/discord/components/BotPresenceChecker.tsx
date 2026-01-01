import { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface BotPresenceCheckerProps {
  guildId: string;
  onBotPresent: () => void;
}

export function BotPresenceChecker({ guildId, onBotPresent }: BotPresenceCheckerProps) {
  const [botPresent, setBotPresent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we're returning from Discord after bot invite
    const invitingGuild = localStorage.getItem('invitingGuild');
    
    if (invitingGuild && invitingGuild === guildId) {
      console.log('🔄 Returning from Discord invite, checking bot presence...');
      localStorage.removeItem('invitingGuild');
      // Check bot presence immediately
      checkBotPresence();
    } else {
      // Normal check
      checkBotPresence();
    }
    
    // Also check periodically for returning users
    const interval = setInterval(() => {
      if (botPresent === true) {
        clearInterval(interval);
        return;
      }
      checkBotPresence();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [guildId, botPresent]);

  const checkBotPresence = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Checking bot presence in guild: ${guildId}`);
      
      const apiUrl = `/api/guilds/${guildId}/channels`;
      console.log(`🌐 Making request to: ${apiUrl}`);
      
      const response = await fetch(apiUrl);
      console.log(`📡 Response status: ${response.status}`);
      
      if (response.ok) {
        console.log("✅ Bot is present in guild - allowing access");
        setBotPresent(true);
        setLoading(false);
        // Notify parent that bot is present - allow access immediately
        onBotPresent();
        return;
      } else if (response.status === 403 || response.status === 404) {
        console.log("❌ Bot is not present - redirecting to invite");
        setBotPresent(false);
        setLoading(false);
        
        // Generate invite URL and redirect immediately
        const inviteResponse = await fetch(`/api/guilds/${guildId}/invite`);
        if (inviteResponse.ok) {
          const { inviteUrl } = await inviteResponse.json();
          console.log("🔗 Redirecting to invite:", inviteUrl);
          // Store that we're inviting to this guild
          localStorage.setItem('invitingGuild', guildId);
          window.location.href = inviteUrl;
        }
        return;
      } else {
        console.log(`❌ Unexpected response status: ${response.status}`);
        const errorText = await response.text();
        console.log(`❌ Error response:`, errorText);
      }
    } catch (error) {
      console.error("❌ Error checking bot presence:", error);
      setBotPresent(null);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 size={16} className="animate-spin text-discord-muted mr-2" />
        <span className="text-xs text-discord-muted">Checking bot presence...</span>
      </div>
    );
  }

  if (botPresent === true) {
    return (
      <div className="flex items-center gap-2 py-2">
        <CheckCircle size={16} className="text-discord-green" />
        <span className="text-xs text-discord-green">Bot is in this server</span>
      </div>
    );
  }

  if (botPresent === false) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 py-2">
          <XCircle size={16} className="text-discord-red" />
          <span className="text-xs text-discord-red">Bot is not in this server - auto inviting...</span>
        </div>
        <div className="flex items-center justify-center py-2">
          <Loader2 size={16} className="animate-spin text-discord-muted mr-2" />
          <span className="text-xs text-discord-muted">Opening invite...</span>
        </div>
        <div className="text-xs text-discord-muted text-center">
          Please authorize the bot in Discord
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-2">
      <XCircle size={16} className="text-discord-red" />
      <span className="text-xs text-discord-red">Unable to check bot presence</span>
    </div>
  );
}
