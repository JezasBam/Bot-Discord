import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApiServer } from "../../src/api/server.js";

describe("API Routes", () => {
  let mockClient;
  let mockLogger;

  beforeEach(() => {
    mockClient = {
      isReady: vi.fn(() => true),
      guilds: {
        cache: {
          size: 1,
        },
      },
      user: {
        id: "123456789",
        username: "TestBot",
        tag: "TestBot#1234",
        displayAvatarURL: vi.fn(() => "https://example.com/avatar.png"),
      },
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };
  });

  it("should create API server without errors", () => {
    expect(() => {
      createApiServer(mockClient, mockLogger);
    }).not.toThrow();
  });

  it("should have health endpoint", () => {
    const { app } = createApiServer(mockClient, mockLogger);
    expect(app).toBeDefined();
  });
});
