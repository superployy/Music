'use strict';

const LanguageManager = require('../src/LanguageManager');
const MusicEmbedManager = require('../src/MusicEmbedManager');
const ErrorHandler = require('../src/ErrorHandler');

/**
 * Central button interaction handler.
 * Registered in index.js under the interactionCreate event.
 *
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {import('../src/MusicPlayer')} musicPlayer
 */
async function handleButton(interaction, musicPlayer) {
  if (!interaction.isButton()) return;

  const { customId, guild, member } = interaction;
  const guildId = guild.id;

  // ── Language picker ─────────────────────────────────────────
  if (customId.startsWith('lang_set_')) {
    const locale = customId.replace('lang_set_', '');
    try {
      await LanguageManager.setGuildLocale(guildId, locale);
      const msg = LanguageManager.getTranslationSync(locale, 'commands.language.changed', {
        lang: `${LanguageManager.getLocaleFlag(locale)} ${LanguageManager.getLocaleName(locale)}`,
      });
      return interaction.reply({ content: `✅ ${msg}`, ephemeral: true });
    } catch (err) {
      return interaction.reply({ content: `❌ Unknown locale: ${locale}`, ephemeral: true });
    }
  }

  // ── Search result picker ─────────────────────────────────────
  if (customId.startsWith('search_pick_')) {
    const parts = customId.split('_');       // search_pick_<index>_<interactionId>
    const index = parseInt(parts[2]);
    const origId = parts[3];
    const cache = interaction.client._searchCache?.get(`search_${origId}`);

    if (!cache) {
      return interaction.reply({ content: '❌ Search session expired.', ephemeral: true });
    }

    await interaction.update({ components: [] });
    const { results, voiceChannel, textChannel, member: origMember } = cache;
    const song = results[index];
    if (!song) return;
    try {
      await musicPlayer.play(voiceChannel, textChannel, song.url, origMember);
    } catch (err) {
      const embed = await ErrorHandler.buildEmbed(err, guildId, 'search_pick');
      interaction.followUp({ embeds: [embed], ephemeral: true });
    }
    interaction.client._searchCache?.delete(`search_${origId}`);
    return;
  }

  if (customId.startsWith('search_cancel_')) {
    return interaction.update({ content: '🔍 Search cancelled.', embeds: [], components: [] });
  }

  // ── Music control buttons ────────────────────────────────────
  if (!customId.startsWith('music_')) return;

  const queue = musicPlayer.getQueue(guildId);
  if (!queue) {
    return interaction.reply({
      content: `❌ ${await LanguageManager.getTranslation(guildId, 'errors.not_playing')}`,
      ephemeral: true,
    });
  }

  // Ensure user is in the same voice channel
  if (member.voice?.channelId !== queue.voiceChannel?.id) {
    const msg = await LanguageManager.getTranslation(guildId, 'errors.not_in_voice');
    return interaction.reply({ content: `❌ ${msg}`, ephemeral: true });
  }

  try {
    switch (customId) {
      case 'music_pause_resume':
        if (queue.paused) await musicPlayer.resume(guildId);
        else              await musicPlayer.pause(guildId);
        await _refreshPanel(interaction, musicPlayer, guildId);
        break;

      case 'music_skip':
        await musicPlayer.skip(guildId);
        await interaction.deferUpdate();
        break;

      case 'music_stop':
        await musicPlayer.stop(guildId);
        await interaction.update({ components: [] });
        break;

      case 'music_loop': {
        const next = (queue.repeatMode + 1) % 3;
        await musicPlayer.setRepeatMode(guildId, next);
        await _refreshPanel(interaction, musicPlayer, guildId);
        break;
      }

      case 'music_shuffle':
        await musicPlayer.shuffle(guildId);
        await interaction.deferUpdate();
        break;

      case 'music_vol_up':
        await musicPlayer.setVolume(guildId, Math.min(queue.volume + 10, 100));
        await _refreshPanel(interaction, musicPlayer, guildId);
        break;

      case 'music_vol_down':
        await musicPlayer.setVolume(guildId, Math.max(queue.volume - 10, 0));
        await _refreshPanel(interaction, musicPlayer, guildId);
        break;

      case 'music_queue': {
        const embed = await MusicEmbedManager.buildQueue(queue, guildId);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }

      case 'music_lyrics': {
        // Redirect to lyrics logic inline
        const song = queue.songs[0];
        if (!song) return interaction.reply({ content: '❌ Nothing playing.', ephemeral: true });
        interaction.reply({ content: `📝 Use \`/lyrics\` to fetch: **${song.name}**`, ephemeral: true });
        break;
      }

      case 'music_prev':
        await musicPlayer.previous(guildId);
        await interaction.deferUpdate();
        break;

      default:
        await interaction.deferUpdate();
    }
  } catch (err) {
    const embed = await ErrorHandler.buildEmbed(err, guildId, `button.${customId}`);
    if (interaction.replied || interaction.deferred) {
      interaction.followUp({ embeds: [embed], ephemeral: true }).catch(() => null);
    } else {
      interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => null);
    }
  }
}

async function _refreshPanel(interaction, musicPlayer, guildId) {
  const q = musicPlayer.getQueue(guildId);
  if (!q || !q.songs[0]) {
    return interaction.update({ components: [] }).catch(() => null);
  }
  const embed = await MusicEmbedManager.buildNowPlaying(q.songs[0], q, guildId);
  const row1 = MusicEmbedManager.buildControlRow(q.paused, q.repeatMode);
  const row2 = MusicEmbedManager.buildVolumeRow();
  return interaction.update({ embeds: [embed], components: [row1, row2] }).catch(() => null);
}

module.exports = { handleButton };
