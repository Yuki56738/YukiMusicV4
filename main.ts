/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// https://discord.com/api/oauth2/authorize?client_id=889751462836568096&permissions=4298120192&scope=bot%20applications.commands
import { Client, Collection, Embed, EmbedBuilder, EmbedData, Events, GatewayIntentBits, Guild, SlashCommandBuilder, SlashCommandStringOption } from 'discord.js'
import { Connectors, Node, Player, Queue, Shoukaku } from 'shoukaku';
declare module "discord.js" {
    export interface Client {
      commands: Collection<any, any>;
      shoukaku: Shoukaku;
    }
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

console.log('Script started.')

let lavalink_auth: string = "";
if (process.env.LAVALINK_AUTH != undefined){
    lavalink_auth = process.env.LAVALINK_AUTH;
}
let lavalink_url = ''
if(process.env.LAVALINK_URL != undefined){
    lavalink_url = process.env.LAVALINK_URL
}
const Nodes = [
    {
    name: 'yukilava',
    url: lavalink_url,
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

const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);
shoukaku.on('error', (_, error) => console.error(error));


client.once(Events.ClientReady, async c =>{
    console.log(`Logged in as: ${c.user.tag}`)
    c.guilds.cache.forEach((guild)=>{
        console.log(guild.name)
    })
    console.log('------------------------')
    // eslint-disable-next-line prefer-const
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
    const commandLeave = new SlashCommandBuilder()
            .setName('leave')
            .setDescription('BOTを退出させる。')
    commands.push(commandLeave.toJSON())
    const commandJoin = new SlashCommandBuilder()
            .setName('join')
            .setDescription('BOTを接続する。')
    commands.push(commandJoin.toJSON())
    await client.application?.commands.set(commands);
})

client.on(Events.InteractionCreate, async interaction =>{
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping'){
        interaction.reply('Pong!')
        return
    }

    if(interaction.commandName === 'join'){
        await interaction.deferReply()
        const embedmsg = new EmbedBuilder()
            .setTitle('音楽BOT Created by Yuki.')
            .setDescription(
                '音楽BOTのプロトタイプ。\n/play [URLまたは曲名] :音楽を再生します。\n/stop :音楽を止めます。\n/leave :BOTを退出させます。'
            )
            
        await interaction.editReply({
            embeds: [embedmsg]
        }).then(msg =>{
            setTimeout(()=> msg.delete(), 10000)
        }).catch((error)=>{
            console.error(error)
        })
        let guildId = ''
        if (interaction.guildId != undefined){
            guildId = String(interaction.guildId)
        }
        const guild = client.guilds.cache.get(String(interaction.guild?.id))
        const member = guild?.members.cache.get(String(interaction.member?.user.id))
        const voiceChannel = member?.voice.channel;
        const node = shoukaku.getNode();
        try{
            const player = await node?.joinChannel(
                {
                    guildId: guildId,
                    channelId: String(voiceChannel?.id),
                    shardId: 0
                }
            )
        }catch(error){
            console.error(error)
        }
    }
    if (interaction.commandName === 'play'){
        await interaction.deferReply()
        const url = interaction.options.getString('url')
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
                if (node?.players != undefined) {
                    for (const x of node.players) {
                        if (x[0] === guildId) {
                            x[1].stopTrack()
                            x[1].playTrack(
                                {
                                    track: String(metadata?.track)
                                }
                            ).setVolume(0.03)
                            await interaction.editReply(`再生中: ${metadata?.info.title}`)
                        }
                    }
                }
            }catch(error){
                console.log(error)
            }
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
            return
        }catch(error){
            console.error(error)
        }
    }
    if(interaction.commandName === 'leave'){
        interaction.reply('wait...')
        try{
            const node = shoukaku.getNode()
            if(interaction.guildId != undefined){
                node?.leaveChannel(interaction.guildId);
            }
            }catch(error){
                console.error(error)
            }
        return
    }
});

client.login(process.env.DISCORD_TOKEN)
client.shoukaku = shoukaku;


client.shoukaku.on('ready', (e: any)=>{
    console.log(`shoukaku is ready: ${e}`)
})

client.shoukaku.on('close', (e: any)=>{
    console.log(`Node connection was closed: ${e}`)
})
