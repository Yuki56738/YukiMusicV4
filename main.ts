import { Client, Collection, Events, GatewayIntentBits, Guild } from 'discord.js'
import { Connectors, Shoukaku } from 'shoukaku';
import fs from 'node:fs'
import path from 'node:path'
declare module "discord.js" {
    export interface Client {
      commands: Collection<any, any>;
      shoukaku: Shoukaku;
    }
  }

require('dotenv').config()

console.log('hello')

let lavalink_auth: string = "";
if (process.env.LAVALINK_AUTH != undefined){
    lavalink_auth = process.env.LAVALINK_AUTH;
}
const Nodes = [
    {
    // name: 'test',
    // url: 'host.kazu123.net:15487',
    // auth: 'test123
    name: 'yukilava',
    url: 'localhost:2333',
    auth: lavalink_auth
    }
]

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
})

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath)

for(const file of commandFiles){
    const filePath = path.join(commandsPath, file);
	const command = require(filePath);
    client.commands.set(command.data.name, command);
}

const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);
shoukaku.on('error', (_, error) => console.error(error));


client.once(Events.ClientReady, c =>{
    console.log(`Logged in as: ${c.user.tag}`)
    c.guilds.cache.forEach((guild)=>{
        console.log(guild.name)
    })
    console.log('------------------------')

})

client.on(Events.InteractionCreate, async interaction =>{
    // console.log(interaction)
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName)
    if (!command){
        console.error(`No command matching: ${interaction.commandName}`)
        return;
    }
    try{
        await command.execute(interaction);
    }catch(error){
        console.error(error)
        await interaction.channel?.send({
            content: '内部の致命的なエラー. 開発者にお問い合わせください。'
        })
    }
})

client.login(process.env.DISCORD_TOKEN)
client.shoukaku = shoukaku;


client.shoukaku.on('ready', (e)=>{
    console.log(`shoukaku is ready: ${e}`)
})

client.shoukaku.on('close', (e)=>{
    console.log(`Node connection was closed: ${e}`)
})