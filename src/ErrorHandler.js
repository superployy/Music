'use strict';

const LanguageManager = require('./LanguageManager');
const { COLORS, EMOJI } = require('../config');
const { EmbedBuilder } = require('discord.js');

const KNOWN_ERRORS = new Map([
  ['NoResultError',          'errors.no_result'],
  ['InvalidTypeError',       'errors.invalid_type'],
  ['NotInVoiceChannel',      'errors.not_in_voice'],
  ['NotPlaying',             'errors.not_playing'],
  ['EmptyQueue',             'errors.empty_queue'],
  ['SongLimitExceeded',      'errors.song_limit'],
  ['NetworkError',           'errors.network'],
  ['YoutubeRestrictedVideo', 'errors.yt_restricted'],
  ['PlaylistNotFound',       'errors.playlist_not_found'],
]);

class ErrorHandler {
  /**
   * Translate an error for the user, log it, and return a reply-safe string.
   * @param {Error}  err
   * @param {string} guildId
   * @param {string} [context]  e.g. 'play.execute'
   * @returns {Promise<string>}
   */
  async handle(err, guildId, context = 'unknown') {
    const key = KNOWN_ERRORS.get(err.constructor?.name) ?? 'errors.generic';
    console.error(`[ErrorHandler][${context}] ${err.constructor?.name ?? 'Error'}: ${err.message}`);
    return LanguageManager.getTranslation(guildId, key, { message: err.message });
  }

  /**
   * Build an embed for an error reply.
   */
  async buildEmbed(err, guildId, context = 'unknown') {
    const msg = await this.handle(err, guildId, context);
    return new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription(`${EMOJI.CROSS} ${msg}`);
  }
}

module.exports = new ErrorHandler();
