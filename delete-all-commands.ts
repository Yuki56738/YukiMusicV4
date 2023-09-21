const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const rest = new REST({ version: '9' }).setToken('your_token_here');
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = '977138017095520256';

rest.get(Routes.applicationGuildCommands(clientId, guildId))
  .then((data: any) => {
    const promises = [];
    for (const command of data) {
      const deleteUrl = `${Routes.applicationGuildCommands(clientId, guildId)}/${command.id}`;
      promises.push(rest.delete(deleteUrl));
    }
    return Promise.all(promises);
  });
