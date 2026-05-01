'use strict';
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const LanguageManager = require('../src/LanguageManager');
const { COLORS } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Fetch lyrics for the current or a specified song.')
    .addStringOption(o =>
      o.setName('song').setDescription('Song title (leave blank for current)').setRequired(false)
    ),

  async execute(interaction, musicPlayer) {
    const { guild } = interaction;
    await interaction.deferReply();

    const queue = musicPlayer.getQueue(guild.id);
    let query = interaction.options.getString('song');

    if (!query && queue?.songs[0]) {
      query = queue.songs[0].name.replace(/\(.*?\)|\[.*?\]/g, '').trim();
    }

    if (!query) {
      const msg = await LanguageManager.getTranslation(guild.id, 'errors.not_playing');
      return interaction.editReply({ content: `❌ ${msg}` });
    }

    try {
      // Try LRCLIB (free, no API key)
      const resp = await axios.get('https://lrclib.net/api/search', {
        params: { q: query },
        timeout: 8_000,
      });

      const result = resp.data?.[0];
      if (!result) throw new Error('Not found');

      const lyrics = result.plainLyrics || result.syncedLyrics?.replace(/\[\d+:\d+\.\d+\]/g, '') || '';
      const chunks = lyrics.match(/[\s\S]{1,3900}/g) ?? [lyrics];

      const embed = new EmbedBuilder()
        .setColor(COLORS.INFO)
        .setTitle(`📝 ${result.trackName} — ${result.artistName}`)
        .setDescription(chunks[0])
        .setFooter({ text: `Source: lrclib.net${chunks.length > 1 ? ` (page 1/${chunks.length})` : ''}` });

      interaction.editReply({ embeds: [embed] });
    } catch {
      const msg = await LanguageManager.getTranslation(guild.id, 'commands.lyrics.not_found', { query });
      interaction.editReply({ content: `❌ ${msg}` });
    }
  },
};
