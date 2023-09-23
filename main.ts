import { Client, Collection, Embed, Events, GatewayIntentBits, Guild, SlashCommandBuilder, SlashCommandStringOption } from 'discord.js'
import { Connectors, Node, Player, Queue, Shoukaku } from 'shoukaku';
import fs from 'node:fs'
import path from 'node:path'
import { userInfo } from 'node:os';
declare module "discord.js" {
    export interface Client {
      commands: Collection<any, any>;
      shoukaku: any;
    }
}

require('dotenv').config()

console.log('Script started.')

let lavalink_auth: string = "";
if (process.env.LAVALINK_AUTH != undefined){
    lavalink_auth = process.env.LAVALINK_AUTH;
}
let testGuildId:string = '';
if (process.env.TEST_GUILD_ID != undefined){
    testGuildId = process.env.TEST_GUILD_ID;
}
const Nodes = [
    {
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

// const commandsPath = path.join(__dirname, 'commands');
// const commandFiles = fs.readdirSync(commandsPath)

// for(const file of commandFiles){
//     const filePath = path.join(commandsPath, file);
// 	const command = require(filePath);
//     client.commands.set(command.data.name, command);
// }

const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);
shoukaku.on('error', (_, error) => console.error(error));


client.once(Events.ClientReady, async c =>{
    console.log(`Logged in as: ${c.user.tag}`)
    c.guilds.cache.forEach((guild)=>{
        console.log(guild.name)
    })
    console.log('------------------------')
    let commands = []
    const commandPing = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Reply with Pong!')
    commands.push(commandPing.toJSON())
    const commandPlay = new SlashCommandBuilder()
        .setName('play')
        .setDescription('音楽を再生する。')
        .addStringOption(option =>
            option
                .setName('url')
                .setDescription('YouTubeのURL')
                .setRequired(true)
        )
    commands.push(commandPlay.toJSON())
    const commandStop = new SlashCommandBuilder()
            .setName('stop')
            .setDescription('音楽を停止する。')
    commands.push(commandStop.toJSON())
    await client.application?.commands.set(commands);
})

client.on(Events.InteractionCreate, async interaction =>{
    // console.log(interaction)
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping'){
        interaction.reply('Pong!')
        return
    }
    if (interaction.commandName === 'play'){
        // interaction.reply('Pong!')
        // const { options } = interaction;
        interaction.reply('wait...')
        let url = interaction.options.getString('url')
        let guildId = ''
        if (interaction.guildId != undefined){
            guildId = String(interaction.guildId)
        }
        const guild = client.guilds.cache.get(String(interaction.guild?.id))
        const member = guild?.members.cache.get(String(interaction.member?.user.id))
        const voiceChannel = member?.voice.channel;
        const node = shoukaku.getNode();
        const result = await node?.rest.resolve(`ytsearch:${String(url)}`)
        const metadata = result?.tracks.shift();
        try{
            const player = await node?.joinChannel(
            {
                guildId: guildId,
                channelId: String(voiceChannel?.id),
                shardId: 0
            }
            )
            player?.playTrack(
                {
                    track: String(metadata?.track)
                }
            )
                .setVolume(0.1)
        }catch(error){
            console.error(error)
            try{
                if (node?.players != undefined) {
                    for (const x of node.players) {
                        if (x[0] === guildId) {
                            x[1].stopTrack()
                            x[1].playTrack(
                                {
                                    track: String(metadata?.track)
                                }
                            ).setVolume(0.1)
                        }
                    }
                }
            }catch(error){
                console.log(error)
            }
        }
        
        // interaction.reply(String(url))
        return
    }
    if(interaction.commandName === 'stop'){
        interaction.reply('wait...')
        try{
            const node = shoukaku.getNode()
            if(node?.players != undefined){
                for (const x of node.players){
                    if(x[0] === interaction.guildId){
                        x[1].stopTrack()
                    }
                }
            }
        }catch(error){
            console.error(error)
        }
    }
})

client.login(process.env.DISCORD_TOKEN)
client.shoukaku = shoukaku;


client.shoukaku.on('ready', (e: any)=>{
    console.log(`shoukaku is ready: ${e}`)
})

client.shoukaku.on('close', (e: any)=>{
    console.log(`Node connection was closed: ${e}`)
})
