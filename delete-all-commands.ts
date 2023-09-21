require('dotenv').config();

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.TEST_GUILD_ID;
    
const rest = new REST({ version: '9' }).setToken(token);
rest.get(Routes.applicationCommands(clientId))
    .then((data: any) => {
        const promises = [];
        for (const command of data) {
            const deleteUrl = `${Routes.applicationGuildCommands(clientId)}/${command.id}`;

            promises.push(rest.delete(deleteUrl));
        }
        return Promise.all(promises);
    });