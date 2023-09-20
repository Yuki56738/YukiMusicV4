import { REST, Routes } from "discord.js"
require('dotenv').config()

let token: string = "";
let cliendId: string = "";
if (process.env.DISCORD_TOKEN != undefined){
    token = process.env.DISCORD_TOKEN
}
if (process.env.DISCORD_CLIENT_ID != undefined){
    cliendId = process.env.DISCORD_CLIENT_ID
}

const commands = [
    {
        name: 'ping',
        description: 'Reply with Pong!'
    }
]

const rest = new REST().setToken(token);

(async ()=>{
try{
    console.log('Registering slash commands...')
    
    await rest.put(Routes.applicationCommands(cliendId))
    console.log('Commands registered succesfully.')
}catch (error){
    console.error(error)
}
})();