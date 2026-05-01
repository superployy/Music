'use strict';
const { SlashCommandBuilder } = require('discord.js');
const LanguageManager = require('../src/LanguageManager');
const ErrorHandler = require('../src/ErrorHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the current queue.'),

  async execute(interaction, musicPlayer) {
    const { guild } = interaction;
    await interaction.deferReply({ ephemeral: true });

    const queue = musicPlayer.getQueue(guild.id);
    if (!queue || queue.songs.length < 2) {
      const msg = await LanguageManager.getTranslation(guild.id, 'errors.empty_queue');
      return interaction.editReply({ content: `❌ ${msg}` });
    }
    try {
      await musicPlayer.shuffle(guild.id);
      const msg = await LanguageManager.getTranslation(guild.id, 'commands.shuffle.success');
      interaction.editReply({ content: `🔀 ${msg}` });
    } catch (err) {
      const embed = await ErrorHandler.buildEmbed(err, guild.id, 'shuffle');
      interaction.editReply({ embeds: [embed] });
    }
  },
};
