'use strict';

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const LanguageManager = require('../src/LanguageManager');
const { COLORS, EMOJI } = require('../config');
const { version } = require('../package.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all commands and bot information.'),

  async execute(interaction) {
    const { guild, client } = interaction;
    await interaction.deferReply();

    const locale = await LanguageManager.getGuildLocale(guild.id);
    const L = (k, v) => LanguageManager.getTranslationSync(locale, k, v);

    const totalGuilds   = client.guilds.cache.size;
    const totalUsers    = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
    const totalChannels = client.channels.cache.size;
    const ping          = client.ws.ping;

    const embed = new EmbedBuilder()
      .setColor(COLORS.PRIMARY)
      .setTitle(`${EMOJI.MUSIC} ${client.user.username} — v${version}`)
      .setDescription(L('commands.help.description'))
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: `${EMOJI.PLAY} ${L('commands.help.playback_title')}`,
          value: [
            '`/play <query>` — Play a song or playlist',
            '`/search <query>` — Interactive YouTube search',
            '`/pause` / `/resume` — Toggle playback',
            '`/skip` — Skip current song',
            '`/stop` — Stop & clear queue',
            '`/nowplaying` — Show player panel',
          ].join('\n'),
          inline: false,
        },
        {
          name: `${EMOJI.QUEUE} ${L('commands.help.queue_title')}`,
          value: [
            '`/queue [page]` — View the queue',
            '`/shuffle` — Shuffle the queue',
            '`/loop <mode>` — Loop off / song / queue',
            '`/volume <0-100>` — Set volume',
          ].join('\n'),
          inline: false,
        },
        {
          name: `${EMOJI.LYRICS} ${L('commands.help.extras_title')}`,
          value: [
            '`/lyrics [song]` — Fetch song lyrics',
            '`/language` — Change server language',
            '`/help` — This menu',
          ].join('\n'),
          inline: false,
        },
        {
          name: `📊 ${L('commands.help.stats_title')}`,
          value: [
            `${EMOJI.MUSIC} **${L('commands.help.guilds')}:** ${totalGuilds.toLocaleString()}`,
            `👥 **${L('commands.help.users')}:** ${totalUsers.toLocaleString()}`,
            `📡 **${L('commands.help.channels')}:** ${totalChannels.toLocaleString()}`,
            `🏓 **Ping:** ${ping}ms`,
          ].join('\n'),
          inline: false,
        },
      )
      .setFooter({ text: `${L('commands.help.supports')}: YouTube • Spotify • SoundCloud • Direct Links` });

    interaction.editReply({ embeds: [embed] });
  },
};
