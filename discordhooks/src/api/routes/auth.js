import { Router } from "express";
import axios from "axios";
import { DISCORD_OAUTH } from "../config/oauth.js";

export function createAuthRouter(logger) {
  const router = Router();

  // Get auth URL
  router.get("/url", (req, res) => {
    try {
      const authUrl = DISCORD_OAUTH.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      logger.error("Auth URL Error:", error);
      res.status(500).json({ error: "Failed to generate auth URL" });
    }
  });

  // OAuth callback
  router.get("/callback", async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: "No authorization code provided" });
    }

    try {
      // Exchange code for access token
      const tokenResponse = await axios.post(
        "https://discord.com/api/oauth2/token",
        new URLSearchParams({
          client_id: DISCORD_OAUTH.CLIENT_ID,
          client_secret: DISCORD_OAUTH.CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: DISCORD_OAUTH.REDIRECT_URI,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { access_token, refresh_token } = tokenResponse.data;

      // Get user info
      const userResponse = await axios.get("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      // Get user guilds
      const guildsResponse = await axios.get("https://discord.com/api/users/@me/guilds", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      // Filter guilds where user is owner
      const ownedGuilds = guildsResponse.data.filter(guild => 
        guild.owner === true || guild.permissions & 0x20 // MANAGE_GUILD permission
      );

      // Store user session (in production, use proper session management)
      const userSession = {
        user: userResponse.data,
        accessToken: access_token,
        refreshToken: refresh_token,
        guilds: ownedGuilds,
      };

      // For now, store in memory (in production, use Redis/database)
      global.userSessions = global.userSessions || new Map();
      global.userSessions.set(userResponse.data.id, userSession);

      // Redirect to frontend with success
      const frontendUrl = process.env.FRONTEND_URL || "https://discord.bambook.ro";
      res.redirect(`${frontendUrl}/?userId=${userResponse.data.id}`);
    } catch (error) {
      logger.error("OAuth callback error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Get user session
  router.get("/session/:userId", (req, res) => {
    const { userId } = req.params;
    const session = global.userSessions?.get(userId);
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Don't send sensitive tokens to frontend
    res.json({
      user: session.user,
      guilds: session.guilds,
    });
  });

  // Logout
  router.post("/logout/:userId", (req, res) => {
    const { userId } = req.params;
    global.userSessions?.delete(userId);
    res.json({ success: true });
  });

  return router;
}
