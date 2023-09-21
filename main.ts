import { Client, Collection, Events, GatewayIntentBits, Guild } from 'discord.js'
import { Connectors, Shoukaku } from 'shoukaku';

declare module "discord.js" {
    export interface Client {
      commands: Collection<any, any>;
      shoukaku: Shoukaku;
    }
  }

require('dotenv').config()

console.log('hello')

const Nodes = [
    {
    // name: 'test',
    // url: 'host.kazu123.net:15487',
    // auth: 'test123
    name: 'yukilava',
    url: 'localhost:2333',
    auth: 'yukilava'
    }
]

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
})

const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);
shoukaku.on('error', (_, error) => console.error(error));


client.once(Events.ClientReady, c =>{
    console.log(`Logged in as: ${c.user.tag}`)
    c.guilds.cache.forEach((guild)=>{
        console.log(guild.name)
    })
    console.log('------------------------')
} )

client.login(process.env.DISCORD_TOKEN)
client.shoukaku = shoukaku;


client.shoukaku.on('ready', (e)=>{
    console.log('shoukaku is ready.')
})