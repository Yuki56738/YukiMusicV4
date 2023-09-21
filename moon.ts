// import 'discord.js'
import { Client, Collection, Events, GatewayIntentBits, Guild } from 'discord.js'
import { MoonlinkManager, MoonlinkWebsocket, Node, NodeStats } from 'moonlink.js';
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
        host: 'host.kazu123.net',
        port: 15487,
        secure: false,
        password: 'test123'
    }],
    {},
    (guild: any, sPayload: any)=>{
        client.guilds.cache.get(guild)?.shard.send(JSON.parse(sPayload));
    }
);
client.moon.on('nodeCreate', (node)=>{
    console.log(`Node ${node.host} was connected.`)
})


// client.commands = new Collection();


client.once(Events.ClientReady, c =>{
    console.log(`Logged in as: ${c.user.tag}`)
    c.guilds.cache.forEach((guild)=>{
        console.log(guild.name)
    })
    console.log('------------------------')
    console.log('Connecting to node...')
    client.moon.init(c.user.id);
} )

client.on('raw', (data)=>{
    client.moon.packetUpdate(data);
})

client.on('interactionCreate', async interaction =>{
    if(!interaction.isChatInputCommand()) return;
    if(interaction.commandName === 'ping'){
        await interaction.reply('Pong!')
    } 
})

client.login(process.env.DISCORD_TOKEN)