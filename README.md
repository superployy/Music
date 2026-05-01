# 🎵 discord-musicbot

> Advanced Discord music bot built on **discord.js v14** + **DisTube v5**  
> YouTube · Spotify · SoundCloud · Direct Links · 21 Languages · Button UI

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🎧 Multi-source playback | YouTube, Spotify (tracks/albums/playlists), SoundCloud, any direct audio URL |
| 🕹️ Rich button panel | Pause/Resume, Skip, Stop, Loop cycle, Shuffle, Volume ±10, Queue, Lyrics, Prev |
| 🔁 Loop modes | Off → Song Repeat → Queue Repeat |
| 🔍 Interactive search | `/search` returns 5 results with numbered buttons |
| 📝 Lyrics | Fetched automatically from LRCLIB (no API key required) |
| 🌐 21 Languages | `/language` — flag button wall for instant localization |
| 📋 Paginated queue | View and manage the queue by page |
| 🚪 Auto-leave | Leaves the voice channel after configurable inactivity timeout |
| 🔒 Permissions check | Validates bot voice permissions before attempting to join |
| 🔧 Slash commands | Full discord.js v14 slash command integration |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js ≥ 18**
- A Discord bot token ([Developer Portal](https://discord.com/developers/applications))
- *(Optional)* Spotify Developer credentials for Spotify link support

### 1. Clone & Install

```bash
git clone https://github.com/your-username/discord-musicbot.git
cd discord-musicbot
npm install
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your token, client ID, and optional Spotify credentials
```

### 3. Register Slash Commands

```bash
# Global (up to 1 hour to propagate):
npm run register

# Instant (add GUILD_ID=your_server_id to .env first):
npm run register
```

### 4. Start the Bot

```bash
npm start
# or for development with auto-restart:
npm run dev
```

---

## ⚙️ Configuration (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_TOKEN` | ✅ | Your bot token |
| `CLIENT_ID` | ✅ | Bot's application ID |
| `GUILD_ID` | ❌ | Guild ID for instant command registration (dev) |
| `SPOTIFY_CLIENT_ID` | ❌ | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | ❌ | Spotify app client secret |
| `YOUTUBE_COOKIE` | ❌ | Browser cookie string for age-gated videos |
| `DEFAULT_VOLUME` | ❌ | Starting volume (0–100, default `50`) |
| `MAX_QUEUE_SIZE` | ❌ | Max songs per queue (0 = unlimited, default `100`) |
| `AUTO_LEAVE_TIMEOUT` | ❌ | Auto-leave delay in ms (0 = never, default `300000`) |
| `DEBUG` | ❌ | Verbose DisTube logs (`true`/`false`) |

---

## 📂 Project Structure

```
discord-musicbot/
├── commands/           # Slash command handlers
│   ├── play.js         # /play — queue a song or playlist
│   ├── search.js       # /search — interactive 5-result picker
│   ├── skip.js         # /skip
│   ├── stop.js         # /stop — stop & clear queue
│   ├── pause.js        # /pause
│   ├── resume.js       # /resume
│   ├── volume.js       # /volume <0-100>
│   ├── queue.js        # /queue [page]
│   ├── loop.js         # /loop <off|song|queue>
│   ├── shuffle.js      # /shuffle
│   ├── nowplaying.js   # /nowplaying — re-display player panel
│   ├── lyrics.js       # /lyrics [song]
│   ├── language.js     # /language — flag button locale picker
│   └── help.js         # /help — command tour + live stats
│
├── events/
│   └── buttonHandler.js  # Routes all button interactions
│
├── src/                # Core services
│   ├── MusicPlayer.js      # DisTube wrapper, play/skip/stop/loop/…
│   ├── MusicEmbedManager.js# Builds all embeds + button rows
│   ├── LanguageManager.js  # Loads packs, resolves translation keys
│   └── ErrorHandler.js     # Translates errors for user display
│
├── languages/          # 21 JSON language packs
│   ├── en.json         # English (base/fallback)
│   ├── es.json         # Español
│   ├── fr.json         # Français
│   └── …              # de, pt, it, ru, ja, zh, ko, nl, pl, tr, ar, hi, id, uk, sv, ro, cs, vi
│
├── database/           # node-json-db store (auto-created)
│
├── config.js           # Central config with env fallbacks
├── index.js            # Bot bootstrap, event wiring, auto-cleanup
├── deploy-commands.js  # One-off slash command registration
├── .env.example        # Template — copy to .env
└── package.json
```

---

## 🎮 Commands

| Command | Description |
|---------|-------------|
| `/play <query>` | Play a song, playlist, or URL |
| `/search <query>` | Search YouTube and pick from 5 results |
| `/skip` | Skip the current track |
| `/stop` | Stop playback and clear the queue |
| `/pause` | Pause playback |
| `/resume` | Resume paused playback |
| `/volume <0-100>` | Set the volume |
| `/queue [page]` | Show the song queue |
| `/loop <mode>` | Set loop mode: off / song / queue |
| `/shuffle` | Shuffle the queue |
| `/nowplaying` | Display the Now Playing panel |
| `/lyrics [song]` | Fetch lyrics (defaults to current song) |
| `/language` | Change bot language for this server |
| `/help` | Show all commands and live bot stats |

---

## 🌐 Supported Languages

English · Español · Français · Deutsch · Português · Italiano · Русский · 日本語 · 中文 · 한국어 · Nederlands · Polski · Türkçe · العربية · हिन्दी · Bahasa Indonesia · Українська · Svenska · Română · Čeština · Tiếng Việt

---

## 🛠️ Adding / Translating a Language

1. Copy `languages/en.json` to `languages/<code>.json`
2. Update `meta.name`, `meta.flag`, and `meta.locale`
3. Translate all string values
4. Restart the bot — it auto-discovers new packs

---

## 📜 License

[MIT](./LICENSE) — free to use, modify, and distribute with attribution.

---

## 🔒 Privacy & Terms

- [Privacy Policy](./PRIVACY_POLICY.md) — only guild ID + language preference are stored
- [Terms of Service](./TERMS_OF_SERVICE.md)
