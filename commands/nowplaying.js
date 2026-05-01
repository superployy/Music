'use strict';
const { SlashCommandBuilder } = require('discord.js');
const LanguageManager = require('../src/LanguageManager');
const MusicEmbedManager = require('../src/MusicEmbedManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show what is currently playing.'),

  async execute(interaction, musicPlayer) {
    const { guild } = interaction;
    await interaction.deferReply();

    const queue = musicPlayer.getQueue(guild.id);
    if (!queue || !queue.songs[0]) {
      const msg = await LanguageManager.getTranslation(guild.id, 'errors.not_playing');
      return interaction.editReply({ content: `❌ ${msg}` });
    }

    const embed = await MusicEmbedManager.buildNowPlaying(queue.songs[0], queue, guild.id);
    const row1 = MusicEmbedManager.buildControlRow(queue.paused, queue.repeatMode);
    const row2 = MusicEmbedManager.buildVolumeRow();
    interaction.editReply({ embeds: [embed], components: [row1, row2] });
  },
};
