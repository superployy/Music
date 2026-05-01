'use strict';

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN     = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID  = process.env.GUILD_ID; // optional: set for instant guild-scoped registration

if (!TOKEN || !CLIENT_ID) {
  console.error('❌ DISCORD_TOKEN and CLIENT_ID must be set in .env');
  process.exit(1);
}

const commands = [];
const cmdDir = path.join(__dirname, 'commands');

for (const file of fs.readdirSync(cmdDir).filter(f => f.endsWith('.js'))) {
  const cmd = require(path.join(cmdDir, file));
  if (cmd?.data?.toJSON) commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  console.log(`📡 Registering ${commands.length} slash command(s)…`);
  try {
    if (GUILD_ID) {
      // Instant update — guild scope (good for dev)
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
      console.log(`✅ Registered to guild ${GUILD_ID} (instant)`);
    } else {
      // Global — up to 1 hr propagation
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log('✅ Registered globally (may take up to 1 hour to propagate)');
    }
  } catch (err) {
    console.error('❌ Registration failed:', err);
  }
})();
