'use strict';
const { SlashCommandBuilder } = require('discord.js');
const LanguageManager = require('../src/LanguageManager');
const MusicEmbedManager = require('../src/MusicEmbedManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current song queue.')
    .addIntegerOption(o =>
      o.setName('page').setDescription('Page number').setMinValue(1).setRequired(false)
    ),

  async execute(interaction, musicPlayer) {
    const { guild } = interaction;
    await interaction.deferReply();

    const queue = musicPlayer.getQueue(guild.id);
    if (!queue || queue.songs.length === 0) {
      const msg = await LanguageManager.getTranslation(guild.id, 'errors.empty_queue');
      return interaction.editReply({ content: `❌ ${msg}` });
    }

    const page = interaction.options.getInteger('page') ?? 1;
    const embed = await MusicEmbedManager.buildQueue(queue, guild.id, page);
    interaction.editReply({ embeds: [embed] });
  },
};
