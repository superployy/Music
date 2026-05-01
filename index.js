'use strict';

require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs   = require('fs');
const path = require('path');
const cfg  = require('./config');
const MusicPlayer  = require('./src/MusicPlayer');
const { handleButton } = require('./events/buttonHandler');

// ── Validate required env ────────────────────────────────────────
if (!cfg.TOKEN) {
  console.error('❌  DISCORD_TOKEN is not set. Copy .env.example → .env and fill in your credentials.');
  process.exit(1);
}
if (!cfg.CLIENT_ID) {
  console.error('❌  CLIENT_ID is not set in .env');
  process.exit(1);
}

// ── Discord client ───────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// ── Load commands ────────────────────────────────────────────────
client.commands = new Collection();
const cmdDir = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(cmdDir).filter(f => f.endsWith('.js'))) {
  const cmd = require(path.join(cmdDir, file));
  if (cmd?.data?.name) {
    client.commands.set(cmd.data.name, cmd);
    console.log(`  ✔ Loaded command: /${cmd.data.name}`);
  }
}

// ── Attach music player (after client exists) ────────────────────
const musicPlayer = new MusicPlayer(client);

// ── Ready ────────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`\n🎵 ${client.user.tag} is online!`);
  console.log(`   Guilds  : ${client.guilds.cache.size}`);
  console.log(`   Commands: ${client.commands.size}`);
  client.user.setActivity({ name: '/play | /help', type: 2 /* LISTENING */ });
});

// ── Interactions ─────────────────────────────────────────────────
client.on('interactionCreate', async (interaction) => {

  // Slash commands
  if (interaction.isChatInputCommand()) {
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return;
    try {
      await cmd.execute(interaction, musicPlayer);
    } catch (err) {
      console.error(`[Command Error][${interaction.commandName}]`, err);
      const reply = { content: `❌ An unexpected error occurred.`, ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        interaction.followUp(reply).catch(() => null);
      } else {
        interaction.reply(reply).catch(() => null);
      }
    }
    return;
  }

  // Buttons
  if (interaction.isButton()) {
    await handleButton(interaction, musicPlayer).catch(err => {
      console.error('[Button Error]', err);
    });
  }
});

// ── Voice auto-cleanup ───────────────────────────────────────────
// If the bot is the only one left in a voice channel, start a leave timer
const leaveTimers = new Map();

client.on('voiceStateUpdate', (oldState, newState) => {
  const botId = client.user?.id;
  if (!botId) return;

  // Bot itself moved / disconnected — clear timer
  if (oldState.id === botId || newState.id === botId) {
    if (!newState.channelId) leaveTimers.delete(oldState.guildId);
    return;
  }

  const queue = musicPlayer.getQueue(oldState.guildId);
  if (!queue) return;

  const vc = queue.voiceChannel;
  if (!vc) return;

  const humanCount = vc.members.filter(m => !m.user.bot).size;

  if (humanCount === 0 && cfg.AUTO_LEAVE_TIMEOUT > 0) {
    // Start leave timer
    if (!leaveTimers.has(oldState.guildId)) {
      const timer = setTimeout(async () => {
        const q2 = musicPlayer.getQueue(oldState.guildId);
        if (q2) {
          await musicPlayer.stop(oldState.guildId).catch(() => null);
          q2.textChannel?.send({ content: '👋 Left the voice channel — everyone left.' }).catch(() => null);
        }
        leaveTimers.delete(oldState.guildId);
      }, cfg.AUTO_LEAVE_TIMEOUT);
      leaveTimers.set(oldState.guildId, timer);
    }
  } else {
    // Someone rejoined — cancel leave timer
    const timer = leaveTimers.get(oldState.guildId);
    if (timer) {
      clearTimeout(timer);
      leaveTimers.delete(oldState.guildId);
    }
  }
});

// ── Graceful shutdown ────────────────────────────────────────────
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException',  err => console.error('[Uncaught Exception]', err));
process.on('unhandledRejection', err => console.error('[Unhandled Rejection]', err));

function shutdown(signal) {
  console.log(`\n[${signal}] Shutting down gracefully…`);
  client.destroy();
  process.exit(0);
}

// ── Login ─────────────────────────────────────────────────────────
client.login(cfg.TOKEN).catch(err => {
  console.error('❌ Login failed:', err.message);
  process.exit(1);
});
