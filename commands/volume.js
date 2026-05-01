'use strict';
const { SlashCommandBuilder } = require('discord.js');
const LanguageManager = require('../src/LanguageManager');
const ErrorHandler = require('../src/ErrorHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set the playback volume (0–100).')
    .addIntegerOption(o =>
      o.setName('level')
        .setDescription('Volume level 0–100')
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)
    ),

  async execute(interaction, musicPlayer) {
    const { guild } = interaction;
    await interaction.deferReply({ ephemeral: true });

    const queue = musicPlayer.getQueue(guild.id);
    if (!queue) {
      const msg = await LanguageManager.getTranslation(guild.id, 'errors.not_playing');
      return interaction.editReply({ content: `❌ ${msg}` });
    }
    const level = interaction.options.getInteger('level', true);
    try {
      await musicPlayer.setVolume(guild.id, level);
      const msg = await LanguageManager.getTranslation(guild.id, 'commands.volume.success', { level });
      interaction.editReply({ content: `🔊 ${msg}` });
    } catch (err) {
      const embed = await ErrorHandler.buildEmbed(err, guild.id, 'volume');
      interaction.editReply({ embeds: [embed] });
    }
  },
};
