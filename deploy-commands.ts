import { REST } from 'discord.js';
import fs from 'node:fs'
import path from 'node:path'

const { Routes } = require('discord.js')

require('dotenv').config()

let token:string = "";
let cliendId: string = "";

if (process.env.DISCORD_TOKEN != undefined){
    token = process.env.DISCORD_TOKEN;
}
if (process.env.DISCORD_CLIENT_ID != undefined){
    cliendId = process.env.DISCORD_CLIENT_ID;
}

const commands: any[] = [];

const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders){
    const commandsPath = path.join(foldersPath)
    const commandFiles = fs.readdirSync(commandsPath)
    for (const file of commandFiles){
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)
        commands.push(command.data.toJSON())
    }
}
const rest: REST = new REST().setToken(token);

(async () =>{
    try{
        console.log('Started deploying commands...');
        const data = await rest.put(
            // Routes.applicationCommands(cliendId),
            Routes.applicationGuildCommands(cliendId, '977138017095520256'),
            { body: commands }
        );
    }catch(error){
        console.error(error);
    }
})();