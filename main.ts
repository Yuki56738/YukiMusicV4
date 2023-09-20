// import 'discord.js'
import { Client, Collection, Events, GatewayIntentBits, Guild } from 'discord.js'
import { MoonlinkManager, MoonlinkWebsocket } from 'moonlink.js';
declare module "discord.js" {
    export interface Client {
      commands: Collection<any, any>;
      moon: MoonlinkManager;
    }
  }
require('dotenv').config()

console.log('hello')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
})

client.moon = new MoonlinkManager(
    [{
        host: 'risaton.net',
        port: 2333,
        secure: false,
        password: 'yukilava'
    }],
    {},
    (guild: any, sPayload: any)=>{
        client.guilds.cache.get(guild)?.shard.send(JSON.parse(sPayload));
    }
);


// client.commands = new Collection();


client.once(Events.ClientReady, c =>{
    console.log(`Logged in as: ${c.user.tag}`)
} )

client.on('interactionCreate', async interaction =>{
    if(!interaction.isChatInputCommand()) return;
    if(interaction.commandName === 'ping'){
        await interaction.reply('Pong!')
    } 
})

client.login(process.env.DISCORD_TOKEN)