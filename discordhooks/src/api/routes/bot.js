import express from "express";
import sharp from "sharp";

export function createBotRouter(client, logger) {
  const router = express.Router();

  // Function to compress image to under 1MB
  async function compressImage(buffer) {
    try {
      let compressedBuffer = buffer;
      let attempts = 0;
      const maxAttempts = 5;

      while (compressedBuffer.length > 1024 * 1024 && attempts < maxAttempts) {
        const quality = Math.max(10, 90 - attempts * 20); // 90, 70, 50, 30, 10

        compressedBuffer = await sharp(buffer)
          .resize(1024, 1024, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .png({ quality, compressionLevel: 9 })
          .toBuffer();

        logger.info(
          `Image compression attempt ${attempts + 1}: ${compressedBuffer.length} bytes (quality: ${quality})`,
        );
        attempts++;
      }

      if (compressedBuffer.length > 1024 * 1024) {
        throw new Error("Image too large even after compression");
      }

      return compressedBuffer;
    } catch (error) {
      logger.error("Image compression failed:", error);
      throw error;
    }
  }

  // Get current bot info
  router.get("/", (req, res) => {
    const user = client.user;
    res.json({
      botReady: client.isReady(),
      user: user
        ? {
            id: user.id,
            username: user.username,
            tag: user.tag,
            avatarUrl: user.displayAvatarURL({ extension: "png", size: 128 }),
          }
        : null,
    });
  });

  // Update bot profile
  router.patch("/profile", async (req, res) => {
    if (!client.user) {
      return res.status(503).json({ error: "Bot user not available" });
    }

    const { username, avatar } = req.body;

    try {
      // Update username if provided
      if (username && typeof username === "string" && username.trim()) {
        await client.user.setUsername(username.trim());
      }

      // Update avatar if provided
      if (
        avatar &&
        typeof avatar === "string" &&
        avatar.startsWith("data:image/")
      ) {
        try {
          const base64Data = avatar.replace(/^data:image\/\w+;base64,/, "");
          let avatarBuffer = Buffer.from(base64Data, "base64");

          // Compress image if it's too large
          if (avatarBuffer.length > 1024 * 1024) {
            logger.info(`Compressing avatar from ${avatarBuffer.length} bytes`);
            avatarBuffer = await compressImage(avatarBuffer);
            logger.info(`Avatar compressed to ${avatarBuffer.length} bytes`);
          }

          await client.user.setAvatar(avatarBuffer);
        } catch (compressionError) {
          logger.error("Avatar processing failed:", compressionError);
          throw new Error(
            "Failed to process avatar image. Please try a smaller image.",
          );
        }
      }

      if (!username && !avatar) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      // Return updated bot info
      const user = client.user;
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          tag: user.tag,
          avatarUrl: user.displayAvatarURL({ extension: "png", size: 128 }),
        },
      });

      logger.info(
        `Bot profile updated: username=${username ? "yes" : "no"}, avatar=${avatar ? "yes" : "no"}`,
      );
    } catch (error) {
      logger.error("Failed to update bot profile:", error);

      // Handle Discord rate limit errors
      let statusCode = 500;
      let errorResponse = {
        error: "Failed to update bot profile",
        details: error.message,
      };

      if (
        error.code === 50035 &&
        error.message.includes("USERNAME_RATE_LIMIT")
      ) {
        statusCode = 429;

        // Try to extract retry-after from Discord error
        let retryAfter = 300; // Default 5 minutes

        // Discord might include retry information in the error message or headers
        if (error.retry_after) {
          retryAfter = error.retry_after;
        } else if (error.headers && error.headers["retry-after"]) {
          retryAfter = parseInt(error.headers["retry-after"]);
        } else {
          // For username changes, Discord often uses longer cooldowns for repeated attempts
          // Let's use a longer default to be safe
          retryAfter = 600; // 10 minutes for repeated attempts
        }

        errorResponse = {
          error: "Rate limit exceeded",
          details: error.message,
          retryAfter: retryAfter,
        };
        logger.error(
          `Rate limit hit for username change, retry after ${retryAfter}s`,
        );
      } else if (
        error.code === 50035 &&
        error.message.includes("USERNAME_TOO_MANY_USERS")
      ) {
        statusCode = 400;
        errorResponse = {
          error: "Username not available",
          details: error.message,
        };
      }

      res.status(statusCode).json(errorResponse);
    }
  });

  return router;
}
