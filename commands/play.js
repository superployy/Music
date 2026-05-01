'use strict';

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const LanguageManager = require('../src/LanguageManager');
const ErrorHandler = require('../src/ErrorHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist from YouTube, Spotify, SoundCloud, or a URL.')
    .addStringOption(o =>
      o.setName('query')
        .setDescription('Song name, URL, or playlist link')
        .setRequired(true)
    ),

  async execute(interaction, musicPlayer) {
    const { guild, member, channel } = interaction;
    await interaction.deferReply();

    const query = interaction.options.getString('query', true);

    // Must be in a voice channel
    const voiceChannel = member.voice?.channel;
    if (!voiceChannel) {
      const msg = await LanguageManager.getTranslation(guild.id, 'commands.play.voice_channel_required');
      return interaction.editReply({ content: `❌ ${msg}` });
    }

    // Check bot permissions in voice
    const perms = voiceChannel.permissionsFor(interaction.client.user);
    if (!perms.has(PermissionFlagsBits.Connect) || !perms.has(PermissionFlagsBits.Speak)) {
      const msg = await LanguageManager.getTranslation(guild.id, 'commands.play.no_permissions');
      return interaction.editReply({ content: `❌ ${msg}` });
    }

    const searchMsg = await LanguageManager.getTranslation(guild.id, 'commands.play.searching_desc', { query });
    await interaction.editReply({ content: `⏳ ${searchMsg}` });

    try {
      await musicPlayer.play(voiceChannel, channel, query, member);
      await interaction.editReply({ content: `✅` }).catch(() => null);
    } catch (err) {
      const embed = await ErrorHandler.buildEmbed(err, guild.id, 'play.execute');
      await interaction.editReply({ embeds: [embed] }).catch(() => null);
    }
  },
};
