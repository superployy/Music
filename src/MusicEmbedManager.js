'use strict';

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { COLORS, EMOJI } = require('../config');
const LanguageManager = require('./LanguageManager');

/**
 * Builds and updates the persistent "Now Playing" embed + button panel.
 */
class MusicEmbedManager {
  // ── Now Playing embed ──────────────────────────────────────────
  async buildNowPlaying(song, queue, guildId) {
    const locale = await LanguageManager.getGuildLocale(guildId);
    const L = (k, v) => LanguageManager.getTranslationSync(locale, k, v);

    const progress = this._progressBar(queue.currentTime, song.duration);
    const loopLabel = ['Off', 'Song', 'Queue'][queue.repeatMode] ?? 'Off';

    const embed = new EmbedBuilder()
      .setColor(COLORS.PRIMARY)
      .setAuthor({ name: L('embed.now_playing'), iconURL: 'https://cdn.discordapp.com/emojis/848130120137277470.gif' })
      .setTitle(song.name)
      .setURL(song.url)
      .setThumbnail(song.thumbnail)
      .addFields(
        { name: L('embed.duration'),   value: `\`${this._fmtDuration(song.duration)}\``,          inline: true },
        { name: L('embed.requested'),  value: `${song.user}`,                                      inline: true },
        { name: L('embed.volume'),     value: `\`${queue.volume}%\``,                              inline: true },
        { name: L('embed.loop'),       value: `\`${loopLabel}\``,                                  inline: true },
        { name: L('embed.queue_size'), value: `\`${queue.songs.length} ${L('embed.songs')}\``,     inline: true },
        { name: L('embed.shuffle'),    value: queue.autoplay ? `\`${L('embed.on')}\`` : `\`${L('embed.off')}\``, inline: true },
        { name: L('embed.progress'),   value: progress, inline: false },
      )
      .setFooter({ text: `${song.formattedDuration} • ${song.views?.toLocaleString() ?? '?'} ${L('embed.views')}` });

    return embed;
  }

  // ── Queue embed ────────────────────────────────────────────────
  async buildQueue(queue, guildId, page = 1) {
    const locale = await LanguageManager.getGuildLocale(guildId);
    const L = (k, v) => LanguageManager.getTranslationSync(locale, k, v);

    const pageSize = 10;
    const songs = queue.songs.slice(1); // exclude current
    const totalPages = Math.max(1, Math.ceil(songs.length / pageSize));
    const clampedPage = Math.min(Math.max(page, 1), totalPages);
    const slice = songs.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

    const lines = slice.map((s, i) =>
      `\`${(clampedPage - 1) * pageSize + i + 1}.\` **[${s.name}](${s.url})** — \`${s.formattedDuration}\` — ${s.user}`
    );

    const totalDuration = queue.songs.reduce((acc, s) => acc + (s.duration || 0), 0);

    return new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(`${EMOJI.QUEUE} ${L('embed.queue_title')}`)
      .setDescription(lines.join('\n') || L('embed.queue_empty'))
      .addFields(
        { name: L('embed.now_playing_short'), value: `**[${queue.songs[0]?.name}](${queue.songs[0]?.url})**`, inline: false },
        { name: L('embed.total_duration'),    value: `\`${this._fmtDuration(totalDuration)}\``, inline: true },
        { name: L('embed.total_songs'),       value: `\`${queue.songs.length}\``,               inline: true },
      )
      .setFooter({ text: `${L('embed.page')} ${clampedPage}/${totalPages}` });
  }

  // ── Error embed ────────────────────────────────────────────────
  buildError(description) {
    return new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription(`${EMOJI.CROSS} ${description}`);
  }

  // ── Success embed ──────────────────────────────────────────────
  buildSuccess(description) {
    return new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setDescription(`${EMOJI.CHECK} ${description}`);
  }

  // ── Song added embed ───────────────────────────────────────────
  async buildSongAdded(song, queue, guildId) {
    const locale = await LanguageManager.getGuildLocale(guildId);
    const L = (k, v) => LanguageManager.getTranslationSync(locale, k, v);

    return new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setAuthor({ name: L('embed.added_to_queue') })
      .setTitle(song.name)
      .setURL(song.url)
      .setThumbnail(song.thumbnail)
      .addFields(
        { name: L('embed.duration'), value: `\`${song.formattedDuration}\``, inline: true },
        { name: L('embed.position'), value: `\`#${queue.songs.length}\``,    inline: true },
        { name: L('embed.by'),       value: `${song.user}`,                  inline: true },
      );
  }

  // ── Playback control buttons ───────────────────────────────────
  buildControlRow(isPaused = false, repeatMode = 0) {
    const pauseBtn = new ButtonBuilder()
      .setCustomId('music_pause_resume')
      .setEmoji(isPaused ? '▶️' : '⏸️')
      .setStyle(ButtonStyle.Secondary);

    const skipBtn = new ButtonBuilder()
      .setCustomId('music_skip')
      .setEmoji('⏭️')
      .setStyle(ButtonStyle.Secondary);

    const stopBtn = new ButtonBuilder()
      .setCustomId('music_stop')
      .setEmoji('⏹️')
      .setStyle(ButtonStyle.Danger);

    const loopBtn = new ButtonBuilder()
      .setCustomId('music_loop')
      .setEmoji('🔁')
      .setStyle(repeatMode > 0 ? ButtonStyle.Primary : ButtonStyle.Secondary);

    const shuffleBtn = new ButtonBuilder()
      .setCustomId('music_shuffle')
      .setEmoji('🔀')
      .setStyle(ButtonStyle.Secondary);

    return new ActionRowBuilder().addComponents(pauseBtn, skipBtn, stopBtn, loopBtn, shuffleBtn);
  }

  buildVolumeRow() {
    const volDown = new ButtonBuilder()
      .setCustomId('music_vol_down')
      .setEmoji('🔉')
      .setStyle(ButtonStyle.Secondary);

    const volUp = new ButtonBuilder()
      .setCustomId('music_vol_up')
      .setEmoji('🔊')
      .setStyle(ButtonStyle.Secondary);

    const queueBtn = new ButtonBuilder()
      .setCustomId('music_queue')
      .setEmoji('📋')
      .setStyle(ButtonStyle.Secondary);

    const lyricsBtn = new ButtonBuilder()
      .setCustomId('music_lyrics')
      .setEmoji('📝')
      .setStyle(ButtonStyle.Secondary);

    const prevBtn = new ButtonBuilder()
      .setCustomId('music_prev')
      .setEmoji('⏮️')
      .setStyle(ButtonStyle.Secondary);

    return new ActionRowBuilder().addComponents(prevBtn, volDown, volUp, queueBtn, lyricsBtn);
  }

  // ── Internal helpers ───────────────────────────────────────────
  _progressBar(current, total, size = 15) {
    if (!total || total <= 0) return '`──────────────●`';
    const pct = Math.min(current / total, 1);
    const filled = Math.round(pct * size);
    const bar = '▬'.repeat(filled) + '🔘' + '─'.repeat(Math.max(0, size - filled));
    return `\`${bar}\` \`${this._fmtDuration(current)} / ${this._fmtDuration(total)}\``;
  }

  _fmtDuration(secs) {
    if (!secs || secs <= 0) return '0:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}

module.exports = new MusicEmbedManager();
