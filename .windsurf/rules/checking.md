---
trigger: always_on
---

# Response Discipline Rule

In every response that includes code:
- Start with 2–5 bullet points prefixed with "Checked:"
- Bullets must confirm:
  - Checked discord.js documentation version
  - Checked existing project files / structure
  - Checked module system (TS/JS, ESM/CJS)
  - Checked MCP Filesystem rules when applicable

## Initial Project Check
All the time edit the files don't let me see the code as I work
## Best Practices Gate (before writing code)

Before generating or applying code, verify:
- discord.js recommended patterns for the feature (per official docs/guide)
- security basics (permissions, token handling, least privilege)
- reliability (error handling, rate limits, retries/backoff where appropriate)
- maintainability (handler pattern, separation of concerns, config validation)

### Initial Checks
- [ ] Verify that the project is properly initialized (e.g. `package.json` exists)
- [ ] Verify the Node.js version (we need to use the latest version)
- [ ] Verify that discord.js is installed and check its version
- [ ] Verify the required file structure (e.g. `src/`, `commands/`, `events/` directories)
- [ ] Verify the existence of the `.env` configuration file (token, client ID, etc.)

### Environment Checks
- [ ] Verify required dependencies in `package.json`

### Documentation
- [ ] Mention the current discord.js version in use
- [ ] Add relevant documentation links

## Project Configuration

### Discord.js References
- [GitHub Repository](https://github.com/discordjs/discord.js)
- [Documentation](https://discord.js.org/docs/packages/discord.js/main)

### Project Setup
- Using npm as the package manager
- Node.js project structure
- Follows modern JavaScript/TypeScript best practices

### Implementation Notes
- Always verify the discord.js version before implementing features
- Check for existing implementations before adding new functionality
- Follow the project's coding style and structure
- Document any external dependencies or requirements
