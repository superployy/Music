'use strict';
require('dotenv').config();

module.exports = {
  // ── Discord ──────────────────────────────────────────────────
  TOKEN: process.env.DISCORD_TOKEN || '',
  CLIENT_ID: process.env.CLIENT_ID || '',

  // ── Spotify ──────────────────────────────────────────────────
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || '',
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || '',

  // ── YouTube ──────────────────────────────────────────────────
  YOUTUBE_COOKIE: process.env.YOUTUBE_COOKIE || '',

  // ── Playback Defaults ────────────────────────────────────────
  DEFAULT_VOLUME: parseInt(process.env.DEFAULT_VOLUME) || 50,
  MAX_QUEUE_SIZE: parseInt(process.env.MAX_QUEUE_SIZE) || 100,

  // ── Auto-leave (ms). 0 = disabled ───────────────────────────
  AUTO_LEAVE_TIMEOUT: parseInt(process.env.AUTO_LEAVE_TIMEOUT) || 300_000,

  // ── Sharding ─────────────────────────────────────────────────
  SHARD_COUNT: process.env.SHARD_COUNT || 'auto',
  SHARD_SPAWN_TIMEOUT: parseInt(process.env.SHARD_SPAWN_TIMEOUT) || 30_000,

  // ── Database ─────────────────────────────────────────────────
  DB_PATH: process.env.DB_PATH || './database/data',

  // ── Debug ────────────────────────────────────────────────────
  DEBUG: process.env.DEBUG === 'true',

  // ── Embed Colours ────────────────────────────────────────────
  COLORS: {
    PRIMARY:  0x5865F2, // Blurple
    SUCCESS:  0x57F287,
    WARNING:  0xFEE75C,
    ERROR:    0xED4245,
    INFO:     0x5DADE2,
  },

  // ── Emoji shorthand (Unicode fallbacks — no custom IDs needed)
  EMOJI: {
    PLAY:     '▶️',
    PAUSE:    '⏸️',
    STOP:     '⏹️',
    SKIP:     '⏭️',
    PREV:     '⏮️',
    LOOP:     '🔁',
    SHUFFLE:  '🔀',
    QUEUE:    '📋',
    VOLUME_UP:'🔊',
    VOL_DOWN: '🔉',
    MUTE:     '🔇',
    LYRICS:   '📝',
    SEARCH:   '🔍',
    LANGUAGE: '🌐',
    MUSIC:    '🎵',
    LOADING:  '⏳',
    CHECK:    '✅',
    CROSS:    '❌',
    WARN:     '⚠️',
  },
};
