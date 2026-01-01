import { useState, useEffect } from "react";
import { Wifi, LogOut, Crown, Server } from "lucide-react";

interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
}

interface UserGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: number;
}

interface AuthState {
  user: User | null;
  guilds: UserGuild[];
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    guilds: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    // Check for existing session
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetchUserSession(userId);
    } else {
      // Check if we're returning from Discord bot invite
      const invitingGuild = localStorage.getItem('invitingGuild');
      if (invitingGuild) {
        console.log('🔄 Returning from Discord bot invite but not authenticated');
        // Clear the inviting guild since we're not authenticated
        localStorage.removeItem('invitingGuild');
        // The page will show auth component automatically since userId is null
      }
    }
    
    // Check if we're returning from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUserId = urlParams.get('userId');
    if (callbackUserId) {
      console.log('🔗 Detected OAuth callback, fetching session for:', callbackUserId);
      localStorage.setItem('userId', callbackUserId);
      fetchUserSession(callbackUserId);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check if we're authenticated and have an inviting guild
    const invitingGuild = localStorage.getItem('invitingGuild');
    const currentUserId = localStorage.getItem('userId');
    if (invitingGuild && currentUserId) {
      console.log('🔄 Checking if bot has joined after invite...');
      // Check bot presence for the inviting guild
      checkBotPresenceAfterInvite(invitingGuild);
    }
  }, []);

  const checkBotPresenceAfterInvite = async (guildId: string) => {
    try {
      console.log(`🔍 Checking bot presence after invite for guild: ${guildId}`);
      const response = await fetch(`/api/guilds/${guildId}/channels`);
      
      if (response.ok) {
        console.log("✅ Bot has joined the guild after invite!");
        localStorage.removeItem('invitingGuild');
        // Trigger a page refresh to update the UI
        window.location.reload();
      } else {
        console.log("⏳ Bot still not joined, will check again...");
        // Check again in 3 seconds
        setTimeout(() => checkBotPresenceAfterInvite(guildId), 3000);
      }
    } catch (error) {
      console.error("❌ Error checking bot presence after invite:", error);
    }
  };

  const fetchUserSession = async (userId: string) => {
    try {
      console.log("🔍 Fetching user session for userId:", userId);
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const response = await fetch(`/api/auth/session/${userId}`);
      console.log("📡 Session response status:", response.status);
      
      if (response.ok) {
        const session = await response.json();
        console.log("✅ Session data received:", session);
        setAuthState({
          user: session.user,
          guilds: session.guilds,
          isLoading: false,
          error: null,
        });
        
        // Store guilds in localStorage for use in ChannelsSidebar
        localStorage.setItem('userGuilds', JSON.stringify(session.guilds));
      } else {
        console.log("❌ Session fetch failed, status:", response.status);
        const errorText = await response.text();
        console.log("❌ Error response:", errorText);
        localStorage.removeItem('userId');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('❌ Failed to fetch user session:', error);
      localStorage.removeItem('userId');
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to fetch session' 
      }));
    }
  };

  const login = async () => {
    try {
      console.log("🔍 Starting authentication...");
      console.log("🌐 Fetching auth URL from:", '/api/auth/url');
      
      const response = await fetch('/api/auth/url');
      console.log("📡 Auth URL Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Auth URL Response error:", errorText);
        throw new Error(`Failed to get auth URL: ${response.status}`);
      }
      
      const { authUrl } = await response.json();
      console.log("🔗 Received auth URL:", authUrl);
      
      console.log("🔄 Redirecting to Discord...");
      window.location.href = authUrl;
    } catch (error) {
      console.error("❌ Login error:", error);
      setAuthState(prev => ({ 
        ...prev, 
        error: `Failed to start authentication: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    }
  };

  const logout = async () => {
    const userId = authState.user?.id;
    if (userId) {
      try {
        await fetch(`/api/auth/logout/${userId}`, { method: 'POST' });
        localStorage.removeItem('userId');
        setAuthState({
          user: null,
          guilds: [],
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Failed to logout:', error);
      }
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const success = urlParams.get('success');

    console.log("🔍 Auth Callback - URL params:", { userId, success });
    console.log("🔍 Auth Callback - Current URL:", window.location.search);

    if (userId) {
      console.log("✅ Auth Callback - Found userId, storing and fetching session");
      localStorage.setItem('userId', userId);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchUserSession(userId);
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    isAuthenticated: !!authState.user,
  };
}

export function AuthComponent({ onGuildSelect }: { onGuildSelect?: (guildId: string) => void }) {
  const { user, guilds, isLoading, error, login, logout, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-discord-blurple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-discord-red text-sm mb-4">{error}</div>
        <button onClick={login} className="btn btn-primary w-full">
          Try Again
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-discord-text mb-2">
            Connect Your Discord Account
          </h3>
          <p className="text-discord-muted text-sm">
            Login to see and manage your Discord servers
          </p>
        </div>
        <button onClick={login} className="btn btn-primary w-full flex items-center justify-center gap-2">
          <Wifi size={16} />
          Connect to Discord
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* User Profile */}
      <div className="bg-discord-light rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-discord-darker overflow-hidden flex-shrink-0">
            {user?.avatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-discord-muted">
                <Crown className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-discord-text truncate">
              {user?.username}#{user?.discriminator}
            </div>
            <div className="text-xs text-discord-muted">
              Server Owner
            </div>
          </div>
          <button
            onClick={logout}
            className="text-xs text-discord-muted hover:text-discord-red flex items-center gap-1"
            title="Logout"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>

      {/* User Guilds */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-discord-text flex items-center gap-2">
          <Server size={14} />
          Your Servers ({guilds.length})
        </h4>
        {guilds.length === 0 ? (
          <p className="text-discord-muted text-sm text-center py-4">
            No servers found where you are the owner
          </p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {guilds.map((guild) => (
              <div
                key={guild.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-discord-light cursor-pointer"
                onClick={() => {
                  console.log("🎯 Guild clicked:", guild.name, guild.id);
                  console.log("🎯 onGuildSelect available:", !!onGuildSelect);
                  if (onGuildSelect) {
                    console.log("🎯 Calling onGuildSelect with:", guild.id);
                    onGuildSelect(guild.id);
                  } else {
                    console.log("❌ onGuildSelect is undefined");
                  }
                }}
              >
                {guild.icon ? (
                  <img
                    src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                    alt=""
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-discord-darker flex items-center justify-center">
                    <Server size={12} className="text-discord-muted" />
                  </div>
                )}
                <span className="text-sm text-discord-text truncate flex-1">
                  {guild.name}
                </span>
                {guild.owner && <Crown size={12} className="text-discord-blurple" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
