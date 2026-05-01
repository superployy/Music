'use strict';

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const LanguageManager = require('../src/LanguageManager');
const ErrorHandler = require('../src/ErrorHandler');
const { COLORS, EMOJI } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search YouTube and pick a song interactively.')
    .addStringOption(o =>
      o.setName('query').setDescription('What to search for').setRequired(true)
    ),

  async execute(interaction, musicPlayer) {
    const { guild, member, channel } = interaction;
    await interaction.deferReply();

    const voiceChannel = member.voice?.channel;
    if (!voiceChannel) {
      const msg = await LanguageManager.getTranslation(guild.id, 'commands.play.voice_channel_required');
      return interaction.editReply({ content: `❌ ${msg}` });
    }

    const query = interaction.options.getString('query', true);

    let results;
    try {
      results = await musicPlayer.search(query, 5);
    } catch (err) {
      const embed = await ErrorHandler.buildEmbed(err, guild.id, 'search.execute');
      return interaction.editReply({ embeds: [embed] });
    }

    if (!results || results.length === 0) {
      const msg = await LanguageManager.getTranslation(guild.id, 'errors.no_result');
      return interaction.editReply({ content: `❌ ${msg}` });
    }

    const locale = await LanguageManager.getGuildLocale(guild.id);
    const L = (k, v) => LanguageManager.getTranslationSync(locale, k, v);

    const desc = results
      .map((s, i) => `\`${i + 1}.\` **[${s.name}](${s.url})** — \`${s.formattedDuration}\``)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(`${EMOJI.SEARCH} ${L('commands.search.results_title')}`)
      .setDescription(desc)
      .setFooter({ text: L('commands.search.pick_prompt') });

    const row = new ActionRowBuilder().addComponents(
      ...results.map((_, i) =>
        new ButtonBuilder()
          .setCustomId(`search_pick_${i}_${interaction.id}`)
          .setLabel(`${i + 1}`)
          .setStyle(ButtonStyle.Primary)
      ),
      new ButtonBuilder()
        .setCustomId(`search_cancel_${interaction.id}`)
        .setLabel(L('commands.search.cancel'))
        .setStyle(ButtonStyle.Secondary)
    );

    const reply = await interaction.editReply({ embeds: [embed], components: [row] });

    // Store search results in the message for the button handler
    // We piggyback the data onto the message object via a client-level map
    const key = `search_${interaction.id}`;
    interaction.client._searchCache ??= new Map();
    interaction.client._searchCache.set(key, { results, voiceChannel, textChannel: channel, member });

    // Auto-expire after 60 s
    setTimeout(() => {
      interaction.client._searchCache?.delete(key);
      reply.edit({ components: [] }).catch(() => null);
    }, 60_000);
  },
};
