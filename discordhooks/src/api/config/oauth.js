// Debug environment variables at module load time
console.log("🔍 OAuth Module Load - All Environment Variables:");
console.log("process.env.CLIENT_ID:", process.env.CLIENT_ID);
console.log("process.env.DISCORD_CLIENT_SECRET:", process.env.DISCORD_CLIENT_SECRET ? "SET" : "NOT_SET");
console.log("process.env.DISCORD_REDIRECT_URI:", process.env.DISCORD_REDIRECT_URI);
console.log("All CLIENT-related env vars:", Object.keys(process.env).filter(key => key.includes('CLIENT')));

export const DISCORD_OAUTH = {
  CLIENT_ID: process.env.CLIENT_ID || '1451236548698837076',
  CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || 'FPIhk8HkVAgB2dDlCKuffzdSc_jVvRCo',
  REDIRECT_URI: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3001/auth/callback',
  SCOPES: ['identify', 'guilds'],
  
  getAuthUrl() {
    const clientId = this.CLIENT_ID;
    console.log("🔧 OAuth Config - CLIENT_ID:", clientId);
    console.log("🔧 OAuth Config - this.CLIENT_ID:", this.CLIENT_ID);
    console.log("🔧 OAuth Config - process.env.CLIENT_ID:", process.env.CLIENT_ID);
    console.log("🔧 OAuth Config - this.REDIRECT_URI:", this.REDIRECT_URI);
    console.log("🔧 OAuth Config - process.env.DISCORD_REDIRECT_URI:", process.env.DISCORD_REDIRECT_URI);
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: this.REDIRECT_URI,
      response_type: 'code',
      scope: this.SCOPES.join(' '),
    });
    return `https://discord.com/api/oauth2/authorize?${params}`;
  }
};
