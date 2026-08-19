# MUS

**Explainability and feedback, embedded exactly where AI output is served.**

When AI outputs need to be questioned, explained, or challenged, that should happen right there on the screen. Not in a form. Not in a meeting. MUS makes that possible for any AI product that has a web face.

[![npm](https://img.shields.io/npm/v/@datachef/mus)](https://www.npmjs.com/package/@datachef/mus)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## What it looks like

Wrap any output with `<FeedbackTarget>`. Users hover. A toolbar appears exactly where the output lives.

![MUS demo: hovering an AI-generated card reveals a feedback toolbar. The recording shows a thumbs-up reaction, a support message opening a Slack channel, and a voice note being recorded and submitted.](./assets/mus-demo.gif)

Try the live, click-through version at [mus.datachef.co](https://mus.datachef.co/#try-it-now).

```tsx
import { MusProvider, FeedbackTarget } from '@datachef/mus'
import '@datachef/mus/styles.css'

function App() {
  return (
    <MusProvider config={{
      projectName: 'My App',
      slack: {
        proxyUrl: '/api/slack-proxy',
        supportTeamEmails: ['you@yourteam.com'],
        feedbackChannelId: 'C0XXXXXXXXX',
      },
    }}>
      <FeedbackTarget sectionId="ai-summary" sectionName="AI Summary">
        <AISummaryOutput />
      </FeedbackTarget>
    </MusProvider>
  )
}
```

One hover. No forms. No context switching. The reaction lands in your Slack, attached to the exact section.

---

## What the toolbar does

| Action | What happens |
|--------|--------------|
| 💬 **Support** | Opens a dedicated Slack channel between the user and your team. One click, full context already attached |
| 🎤 **Voice** | Records a voice clip (up to 3 min), converted to MP3 and posted to Slack with the section name |
| 👍 / 👎 **Thumbs** | Fire-and-forget: instant signal, zero friction |
| ▶ **Video** | Plays an explainer video attached to that section. Context that stays, not a one-time tour |

---

## Installation

```bash
npm install @datachef/mus
```

For voice feedback, also install the optional audio converter:

```bash
npm install ffmpeg-static   # optional; falls back to system ffmpeg
```

---

## Server setup

The package ships ready-made server handlers. Keep `SLACK_BOT_TOKEN` on the server and never in the browser.

### Next.js (App Router)

```ts
// app/api/mus/voice-upload/route.ts
export { POST } from '@datachef/mus/server'

// app/api/mus/standalone-upload/route.ts
export { POSTStandalone as POST } from '@datachef/mus/server'

// app/api/mus/support-channel/route.ts
export { POSTSupportChannel as POST } from '@datachef/mus/server'
```

```bash
# .env.local
SLACK_BOT_TOKEN=xoxb-your-bot-token
```

### Adapter pattern (Slack, Discord, Teams, or custom)

```ts
import { createMusHandlers } from '@datachef/mus/server'
import { slackAdapter } from '@datachef/mus/adapters/slack'
import { discordAdapter } from '@datachef/mus/adapters/discord'

export const { POST, POSTStandalone, POSTSupportChannel } = createMusHandlers({
  adapter: [
    slackAdapter({ token: process.env.SLACK_BOT_TOKEN! }),
    discordAdapter({ webhookUrl: process.env.DISCORD_WEBHOOK_URL! }),
  ],
})
```

### Vite SPA (no backend)

```ts
// vite.config.ts
import { musVitePlugins } from '@datachef/mus/vite'

export default defineConfig({
  plugins: [react(), ...musVitePlugins()],
})
```

Production: run the pre-built `mus-server` Docker image alongside your app. No Node.js server to maintain:

```yaml
services:
  mus-server:
    image: ghcr.io/datachefhq/mus-server:latest
    environment:
      - SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}
```

---

## User identity

MUS auto-fills name and email from your auth system via pluggable resolvers:

```ts
import { clerkResolver } from '@datachef/mus/resolvers/clerk'

<MusProvider config={{
  ...
  userResolver: clerkResolver(),
}}>
```

Built-in resolvers: `stytchResolver`, `clerkResolver`, `auth0Resolver`, `nextAuthResolver`. Or write your own: a resolver is just a React hook that returns `{ name, email }`.

---

## Full docs

**[mus.datachef.co](https://mus.datachef.co)**: configuration reference, adapters, resolvers, and server setup guides for Next.js / Express / Hono / Vite.

---

## Non-React backends

The component library is React (18 and 19). The server handlers and `mus-server` Docker image are framework-agnostic, so your backend can be anything.

---

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) and open a PR. Issues and feature requests welcome.

## License

MIT © [DataChef HQ](https://github.com/DataChefHQ)
