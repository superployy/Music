'use strict';
const { SlashCommandBuilder } = require('discord.js');
const LanguageManager = require('../src/LanguageManager');
const ErrorHandler = require('../src/ErrorHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop playback and clear the queue.'),

  async execute(interaction, musicPlayer) {
    const { guild } = interaction;
    await interaction.deferReply({ ephemeral: true });

    const queue = musicPlayer.getQueue(guild.id);
    if (!queue) {
      const msg = await LanguageManager.getTranslation(guild.id, 'errors.not_playing');
      return interaction.editReply({ content: `❌ ${msg}` });
    }
    try {
      await musicPlayer.stop(guild.id);
      const msg = await LanguageManager.getTranslation(guild.id, 'commands.stop.success');
      interaction.editReply({ content: `⏹️ ${msg}` });
    } catch (err) {
      const embed = await ErrorHandler.buildEmbed(err, guild.id, 'stop');
      interaction.editReply({ embeds: [embed] });
    }
  },
};
