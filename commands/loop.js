'use strict';
const { SlashCommandBuilder } = require('discord.js');
const LanguageManager = require('../src/LanguageManager');
const ErrorHandler = require('../src/ErrorHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Set loop mode.')
    .addStringOption(o =>
      o.setName('mode')
        .setDescription('Loop mode')
        .setRequired(true)
        .addChoices(
          { name: 'Off',   value: '0' },
          { name: 'Song',  value: '1' },
          { name: 'Queue', value: '2' },
        )
    ),

  async execute(interaction, musicPlayer) {
    const { guild } = interaction;
    await interaction.deferReply({ ephemeral: true });

    const queue = musicPlayer.getQueue(guild.id);
    if (!queue) {
      const msg = await LanguageManager.getTranslation(guild.id, 'errors.not_playing');
      return interaction.editReply({ content: `❌ ${msg}` });
    }

    const mode = parseInt(interaction.options.getString('mode', true));
    const labels = ['off', 'song', 'queue'];
    try {
      await musicPlayer.setRepeatMode(guild.id, mode);
      const msg = await LanguageManager.getTranslation(guild.id, 'commands.loop.success', { mode: labels[mode] });
      interaction.editReply({ content: `🔁 ${msg}` });
    } catch (err) {
      const embed = await ErrorHandler.buildEmbed(err, guild.id, 'loop');
      interaction.editReply({ embeds: [embed] });
    }
  },
};
