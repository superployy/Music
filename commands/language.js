'use strict';

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const LanguageManager = require('../src/LanguageManager');
const { COLORS } = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('language')
    .setDescription('Change the bot language for this server.'),

  async execute(interaction) {
    const { guild } = interaction;
    await interaction.deferReply({ ephemeral: true });

    const locales = LanguageManager.availableLocales;
    const currentLocale = await LanguageManager.getGuildLocale(guild.id);
    const L = (k) => LanguageManager.getTranslationSync(currentLocale, k);

    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle(`🌐 ${L('commands.language.title')}`)
      .setDescription(L('commands.language.description'))
      .setFooter({ text: `${L('commands.language.current')}: ${LanguageManager.getLocaleFlag(currentLocale)} ${LanguageManager.getLocaleName(currentLocale)}` });

    // Split into rows of 5 (Discord limit: 5 buttons/row, 5 rows/message)
    const rows = [];
    const chunkSize = 5;
    for (let i = 0; i < Math.min(locales.length, 25); i += chunkSize) {
      const chunk = locales.slice(i, i + chunkSize);
      const row = new ActionRowBuilder().addComponents(
        chunk.map(locale =>
          new ButtonBuilder()
            .setCustomId(`lang_set_${locale}`)
            .setLabel(`${LanguageManager.getLocaleFlag(locale)} ${LanguageManager.getLocaleName(locale)}`)
            .setStyle(locale === currentLocale ? ButtonStyle.Primary : ButtonStyle.Secondary)
        )
      );
      rows.push(row);
    }

    interaction.editReply({ embeds: [embed], components: rows });
  },
};
