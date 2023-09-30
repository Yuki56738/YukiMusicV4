/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Client, EmbedBuilder, Events, GatewayIntentBits, GuildBasedChannel, SlashCommandBuilder, TextChannel } from 'discord.js';
const {Guilds, GuildVoiceStates, GuildMessages, MessageContent} = GatewayIntentBits;
import { Connectors } from "shoukaku";
import { Kazagumo, KazagumoTrack } from "kazagumo"
import { error } from 'console';
declare module "discord.js" {
    export interface Client {
    }
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
// let lavalink_auth: string = "";
const lavalink_auth = process.env.LAVALINK_AUTH!
const lavalink_url = process.env.LAVALINK_URL!

const Nodes = [
    {
    name: 'yukilava',
    url: lavalink_url,
    auth: lavalink_auth,
    secure: false
    }
]

const client = new Client({intents: [Guilds, GuildVoiceStates, GuildMessages, MessageContent]});

const kazagumo = new Kazagumo({
    defaultSearchEngine: "youtube",
    // MAKE SURE YOU HAVE THIS
    send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    }
}, new Connectors.DiscordJS(client), Nodes);

client.once(Events.ClientReady, async c =>{
    console.log(`Logged in as: ${c.user.tag}`)
    c.guilds.cache.forEach((guild)=>{
        console.log(guild.name)
    })
    console.log('------------')
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
    const commandLeave = new SlashCommandBuilder()
            .setName('leave')
            .setDescription('BOTを退出させる。')
    commands.push(commandLeave.toJSON())
    const commandStop = new SlashCommandBuilder()
            .setName('stop')
            .setDescription('音楽を止める。')
    commands.push(commandStop.toJSON())
    await client.application?.commands.set(commands);
})

let playingGuildIds: (string | null)[] = []

client.on(Events.InteractionCreate, async interaction =>{
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'ping'){
        interaction.reply('Pong!')
        return
    }
    if(interaction.commandName === 'play'){
        await interaction.reply('wait...')
        const embedmsg = new EmbedBuilder()
            .setTitle('音楽BOT Created by Yuki.')
            .setDescription(
                '音楽BOTのプロトタイプ。\n/play [URLまたは曲名] :音楽を再生します。\n/stop :音楽を止めます。\n/leave :BOTを退出させます。'
            )
        
        const query = interaction.options.getString('url')
        const member = interaction.guild?.members.cache.get(String(interaction.member?.user.id))
        try{
        const voiceChannel = member?.voice.channel;
        
        let player = await kazagumo.createPlayer({
            guildId: String(interaction.guild?.id),
            textId: interaction.channelId,
            voiceId: voiceChannel!.id,
            volume: 1
        })
        let result = await kazagumo.search(query!, {
            requester: interaction.user
        })
        if(result.type === "TRACK"){
            player.queue.add(result.tracks[0])
        }
        if (!player.playing && !player.paused){
            player.play()
            await interaction.editReply({
                embeds: [embedmsg]
            }).then(msg =>{
                setTimeout(()=>
                    msg.delete(), 10000
                )
            }).catch((error)=>{
                console.error(error)
            }
            )
            playingGuildIds.push(interaction.guildId)
        }
    }catch(error){
        console.error(error)
    }
    }
    if(interaction.commandName === 'stop'){
        await interaction.reply('wait...')
        try{
        kazagumo.getPlayer(interaction.guildId!)?.pause(true)
        }catch(error){
            console.error(error)
        }
    }

    if(interaction.commandName === 'leave'){
        interaction.reply('wait...')
        kazagumo.getPlayer(interaction.guildId!)?.disconnect()
    }
})

kazagumo.shoukaku.on('ready', (name)=>{
    console.log(`Node ${name} is ready.`)
})
kazagumo.shoukaku.on('error', (name, error) => console.error(`Lavalink ${name}: Error Caught,`, error));
kazagumo.shoukaku.on('close', (name, code, reason) => console.warn(`Lavalink ${name}: Closed, Code ${code}, Reason ${reason || 'No reason'}`));
// kazagumo.shoukaku.on('debug', (name, info) => console.debug(`Lavalink ${name}: Debug,`, info));

kazagumo.on('playerStart', (player, track)=>{
    const channel = client.channels.cache.get(player.textId) as TextChannel
    channel.send(`再生中： ${track.title} by ${track.author}`)
})

client.on('voiceStateUpdate', (oldUser, newUser)=>{
    console.log(oldUser.channel?.members.toJSON().length)
    if(oldUser.channel?.members.toJSON().length == 1){
        kazagumo.getPlayer(oldUser.guild.id)?.disconnect()
    }
})

client.login(process.env.DISCORD_TOKEN)
