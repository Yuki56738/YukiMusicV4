import { REST } from 'discord.js';
import fs from 'node:fs'
import path from 'node:path'

const { Routes } = require('discord.js')

require('dotenv').config()

let token:string = "";
let clientId: string = "";

if (process.env.DISCORD_TOKEN != undefined){
    token = process.env.DISCORD_TOKEN;
}
if (process.env.DISCORD_CLIENT_ID != undefined){
    clientId = process.env.DISCORD_CLIENT_ID;
}

const commands: any[] = [];

const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

// for (const folder of commandFolders){
//     const commandsPath = path.join(foldersPath)
//     const commandFiles = fs.readdirSync(commandsPath)
//     for (const file of commandFiles){
//         const filePath = path.join(commandsPath, file)
//         const command = require(filePath)
//         commands.push(command.data.toJSON())
//     }
// }
const rest: REST = new REST().setToken(token);

(async () =>{
    try{
      rest.put(Routes.applicationGuildCommands(clientId, '977138017095520256'), { body: [] })
      .then(() => console.log('Successfully deleted all guild commands.'))
      .catch(console.error);
    
    // for global commands
    rest.put(Routes.applicationCommands(clientId), { body: [] })
      .then(() => console.log('Successfully deleted all application commands.'))
      .catch(console.error);
    }catch(error){
        console.error(error);
    }
})();