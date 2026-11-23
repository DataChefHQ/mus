## 1.1.3 (2026-11-23)

### Features
- feat: add llms.txt file
- feat: live sandbox changed
- feat: add clarity and cookie banner

### Other Changes
- ci(release): build mus-server image for amd64 and arm64

## 1.1.2 (2026-07-07)

### Features
- feat: update the site content and design

### Bug Fixes
- fix: broken links and change them from @datachefhq to @datachef
- fix: broken npm link
- fix: check for Node availability

### Other Changes
- chore: change preview image

## 1.1.1 (2026-07-02)

### Other Changes
- chore: update workflow token name

## 1.1.0 (2026-07-02)

### Features
- feat: update server to handle multiple adapter configuration
- feat: add theme to playground
- feat(website): fix playground hydration, add mobile docs nav, and refresh landing styles
- feat: add adapter for auth and notify flow

### Bug Fixes
- fix: disable demo on mobile
- fix: build issue on cloudflare

### Other Changes
- chore: update version to v1.0.0
- chore: update package scope to @datachef/mus
- chore: add wrangler.toml for Cloudflare static asset deployment
- chore: update readme
- docs: add documentation for configuring MUS
- chore: prepare for open source release — MIT license, npm publish, CLI init, contributors

## 1.0.0 (2026-07-01)

### Features
- feat: add adapter for auth and notify flow

### Bug Fixes
- fix: build issue on cloudflare

### Other Changes
- chore: update package scope to @datachef/mus
- chore: add wrangler.toml for Cloudflare static asset deployment
- chore: update readme
- docs: add documentation for configuring MUS
- chore: prepare for open source release — MIT license, npm publish, CLI init, contributors

## 0.4.0 (2026-06-29)

### Breaking Changes
- **Stytch auto-detection removed** — if you use Stytch, add `userResolver: stytchResolver()` explicitly. See [Upgrade Guide](./website/src/content/docs/migration.md).

### Features
- Adapter system: `slackAdapter`, `discordAdapter`, `teamsAdapter`, `webhookAdapter` — route feedback to any destination
- `createMusHandlers` factory — wire adapters to your server handlers
- User resolver system: `stytchResolver`, `clerkResolver`, `auth0Resolver`, `nextAuthResolver`
- `userResolver` config option — plug in any React hook returning `{ name, email }`
- All sub-path imports now work: `@datachef/mus/adapters/slack`, `@datachef/mus/resolvers/clerk`, etc.

### Bug Fixes
- Fixed React hooks rules violation in `useMusUser` — hooks count is now stable across renders
- `@stytch/react` no longer bundled into every user's app — moved to optional peer dependency
- `ffmpeg-static` moved to `optionalDependencies` — no longer a mandatory 44MB install

### Other Changes
- 65 tests added across adapters, resolvers, server handlers, and all hooks/components

## 0.3.2 (2026-05-13)

### Other Changes
- chore: update order and icons

## 0.3.1 (2026-05-12)

### Features
- feat(mus-server): add standalone server image and publish on release

## 0.3.0 (2026-05-11)

### Features
- feat: export musVitePlugins() for zero-config Vite dev server setup Adds @datachef/mus/vite entry that exports musVitePlugins() — a single Vite plugin registering all three mus server handlers (voice-upload, standalone-upload, support-channel). Consuming apps replace boilerplate middleware code with:   import { musVitePlugins } from '@datachef/mus/vite'   plugins: [...musVitePlugins()] Also reverts anonymous-user dedicated channel: unauthenticated support requests now post directly to feedbackChannelId without channel creation.
- feat: server-side support channel with idempotent find-or-create Authenticated users get a private per-user channel named {prefix}-{projectSlug}-{emailSlug} — same channel every time across sessions. Unauthenticated users route to {projectSlug}-general-support, auto-created on first use. Channel creation calls Slack API directly (SLACK_BOT_TOKEN) via the new POSTSupportChannel server handler, bypassing chefbot for full control over privacy, membership, and idempotent lookup. Support team is invited via users.lookupByEmail + conversations.invite; bot is already a member as channel creator. Adds projectSlug? to MusConfig, supportChannelUrl? to SlackConfig.
- feat: add enabled flag to MusConfig for global on/off control

### Other Changes
- revert: restore original SupportDialog description text

## 0.2.3 (2026-05-11)

### Bug Fixes
- fix: feedback target component position style

## 0.2.2 (2026-05-11)

### Features
- feat: add inset prop to FeedbackTarget for page-level positioning

## 0.2.1 (2026-05-09)

### Features
- feat: add captureExtensionAndTab helper and built-in default screenshot

# Changelog

## 0.2.0 (2026-05-08)

### Features
- feat: add standalone mode with screenshot capture, voice feedback, and release script
