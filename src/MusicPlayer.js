'use strict';

const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const path = require('path');
const fs = require('fs');
const cfg = require('../config');
const MusicEmbedManager = require('./MusicEmbedManager');
const LanguageManager = require('./LanguageManager');

// Local audio cache directory
const CACHE_DIR = path.join(__dirname, '..', '.cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

class MusicPlayer {
  /**
   * @param {import('discord.js').Client} client
   */
  constructor(client) {
    this.client = client;
    this._initDistube();
    this._registerEvents();
  }

  _initDistube() {
    const plugins = [
      new SpotifyPlugin({
        parallel: true,
        emitEventsAfterFetching: true,
        ...(cfg.SPOTIFY_CLIENT_ID && cfg.SPOTIFY_CLIENT_SECRET
          ? { api: { clientId: cfg.SPOTIFY_CLIENT_ID, clientSecret: cfg.SPOTIFY_CLIENT_SECRET } }
          : {}),
      }),
      new SoundCloudPlugin(),
      new YtDlpPlugin({ update: false }),
    ];

    this.distube = new DisTube(this.client, {
      plugins,
      emitNewSongOnly: false,
      leaveOnEmpty: true,
      leaveOnFinish: false,
      leaveOnStop: true,
      emptyCooldown: Math.floor(cfg.AUTO_LEAVE_TIMEOUT / 1000),
      nsfw: false,
      youtubeCookie: cfg.YOUTUBE_COOKIE || undefined,
    });
  }

  // ── DisTube event handlers ──────────────────────────────────────
  _registerEvents() {
    const d = this.distube;

    d.on('playSong', async (queue, song) => {
      const ch = queue.textChannel;
      if (!ch) return;
      const embed = await MusicEmbedManager.buildNowPlaying(song, queue, ch.guildId);
      const row1 = MusicEmbedManager.buildControlRow(false, queue.repeatMode);
      const row2 = MusicEmbedManager.buildVolumeRow();
      const msg = await ch.send({ embeds: [embed], components: [row1, row2] }).catch(() => null);
      // Store message reference for live-updating
      if (msg) queue.player_message = msg;
    });

    d.on('addSong', async (queue, song) => {
      const ch = queue.textChannel;
      if (!ch) return;
      const embed = await MusicEmbedManager.buildSongAdded(song, queue, ch.guildId);
      ch.send({ embeds: [embed] }).catch(() => null);
    });

    d.on('addList', async (queue, playlist) => {
      const ch = queue.textChannel;
      if (!ch) return;
      const locale = await LanguageManager.getGuildLocale(ch.guildId);
      const msg = LanguageManager.getTranslationSync(locale, 'events.playlist_added', {
        name: playlist.name,
        count: playlist.songs.length,
      });
      ch.send({ content: `✅ ${msg}` }).catch(() => null);
    });

    d.on('finish', async (queue) => {
      const ch = queue.textChannel;
      if (!ch) return;
      const locale = await LanguageManager.getGuildLocale(ch.guildId);
      const msg = LanguageManager.getTranslationSync(locale, 'events.queue_finished');
      ch.send({ content: `⏹️ ${msg}` }).catch(() => null);
      if (queue.player_message) {
        queue.player_message.edit({ components: [] }).catch(() => null);
      }
    });

    d.on('disconnect', (queue) => {
      if (queue.player_message) {
        queue.player_message.edit({ components: [] }).catch(() => null);
      }
    });

    d.on('error', async (channel, error) => {
      console.error('[DisTube Error]', error.message);
      if (channel) {
        const locale = await LanguageManager.getGuildLocale(channel.guildId).catch(() => 'en');
        const msg = LanguageManager.getTranslationSync(locale, 'errors.playback', { message: error.message });
        channel.send({ content: `❌ ${msg}` }).catch(() => null);
      }
    });

    d.on('empty', async (queue) => {
      const ch = queue.textChannel;
      if (!ch) return;
      const locale = await LanguageManager.getGuildLocale(ch.guildId);
      const msg = LanguageManager.getTranslationSync(locale, 'events.channel_empty');
      ch.send({ content: `🚪 ${msg}` }).catch(() => null);
    });

    if (cfg.DEBUG) {
      d.on('debug', (_, message) => console.debug('[DisTube Debug]', message));
    }
  }

  // ── Public API ──────────────────────────────────────────────────

  /** Play or enqueue a song/playlist/URL */
  async play(voiceChannel, textChannel, query, member) {
    return this.distube.play(voiceChannel, query, {
      textChannel,
      member,
      position: 0,
    });
  }

  /** Search and return results without auto-playing */
  async search(query, limit = 5) {
    return this.distube.search(query, { limit, type: 'video' });
  }

  getQueue(guildId) {
    return this.distube.getQueue(guildId);
  }

  async skip(guildId)    { return this.distube.skip(guildId); }
  async stop(guildId)    { return this.distube.stop(guildId); }
  async pause(guildId)   { return this.distube.pause(guildId); }
  async resume(guildId)  { return this.distube.resume(guildId); }
  async shuffle(guildId) { return this.distube.shuffle(guildId); }
  async previous(guildId){ return this.distube.previous(guildId); }

  async setVolume(guildId, vol) {
    const clamped = Math.min(Math.max(vol, 0), 100);
    return this.distube.setVolume(guildId, clamped);
  }

  async setRepeatMode(guildId, mode) {
    // 0 = off, 1 = song, 2 = queue
    return this.distube.setRepeatMode(guildId, mode);
  }

  async seek(guildId, seconds) {
    return this.distube.seek(guildId, seconds);
  }
}

module.exports = MusicPlayer;
