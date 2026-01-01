export const DISCORD_OAUTH = {
  CLIENT_ID: process.env.CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
  CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE',
  REDIRECT_URI: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3001/auth/callback',
  SCOPES: ['identify', 'guilds'],
  
  getAuthUrl() {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      response_type: 'code',
      scope: this.SCOPES.join(' '),
    });
    return `https://discord.com/api/oauth2/authorize?${params}`;
  }
};
