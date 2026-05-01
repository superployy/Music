'use strict';

const path = require('path');
const fs = require('fs');
const { JsonDB, Config } = require('node-json-db');
const cfg = require('../config');

/**
 * Manages per-guild language preferences and translates keys.
 */
class LanguageManager {
  constructor() {
    this._packs = {};        // { locale: data }
    this._defaultLocale = 'en';
    this._db = null;
    this._init();
  }

  _init() {
    // Load database
    this._db = new JsonDB(new Config(cfg.DB_PATH, true, true, '/'));

    // Load every JSON language pack
    const langDir = path.join(__dirname, '..', 'languages');
    if (!fs.existsSync(langDir)) return;

    for (const file of fs.readdirSync(langDir)) {
      if (!file.endsWith('.json')) continue;
      const locale = file.replace('.json', '');
      try {
        this._packs[locale] = JSON.parse(fs.readFileSync(path.join(langDir, file), 'utf8'));
      } catch (e) {
        console.warn(`[LanguageManager] Failed to load ${file}:`, e.message);
      }
    }
  }

  /** Return locale code for a guild (defaults to 'en') */
  async getGuildLocale(guildId) {
    try {
      return await this._db.getData(`/guilds/${guildId}/locale`);
    } catch {
      return this._defaultLocale;
    }
  }

  /** Persist locale preference for a guild */
  async setGuildLocale(guildId, locale) {
    if (!this._packs[locale]) throw new Error(`Unknown locale: ${locale}`);
    await this._db.push(`/guilds/${guildId}/locale`, locale, true);
  }

  /**
   * Resolve a dot-separated translation key with optional interpolation vars.
   * Falls back to English, then the raw key.
   *
   * @param {string} guildId
   * @param {string} key        e.g. 'commands.play.searching_desc'
   * @param {Object} [vars]     e.g. { query: 'Bohemian Rhapsody' }
   */
  async getTranslation(guildId, key, vars = {}) {
    const locale = await this.getGuildLocale(guildId);
    const str = this._resolve(locale, key) ?? this._resolve(this._defaultLocale, key) ?? key;
    return this._interpolate(str, vars);
  }

  /** Synchronous version — useful where async is inconvenient */
  getTranslationSync(locale, key, vars = {}) {
    const str = this._resolve(locale, key) ?? this._resolve(this._defaultLocale, key) ?? key;
    return this._interpolate(str, vars);
  }

  _resolve(locale, key) {
    const pack = this._packs[locale];
    if (!pack) return undefined;
    return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined ? obj[k] : undefined), pack);
  }

  _interpolate(str, vars) {
    return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
  }

  /** All available locales */
  get availableLocales() {
    return Object.keys(this._packs);
  }

  /** Human-readable name from pack's meta.name field */
  getLocaleName(locale) {
    return this._packs[locale]?.meta?.name ?? locale;
  }

  /** Flag emoji from pack's meta.flag field */
  getLocaleFlag(locale) {
    return this._packs[locale]?.meta?.flag ?? '🌐';
  }
}

module.exports = new LanguageManager(); // singleton
