/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Client, Events, GatewayIntentBits, SlashCommandBuilder } from 'discord.js';
const {Guilds, GuildVoiceStates, GuildMessages, MessageContent} = GatewayIntentBits;
import { Connectors } from "shoukaku";
import { Kazagumo, KazagumoTrack } from "kazagumo"
import { error } from 'console';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
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
    await client.application?.commands.set(commands);
})

client.on(Events.InteractionCreate, async interaction =>{
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'ping'){
        interaction.reply('Pong!')
        return
    }
    if(interaction.commandName === 'play'){
        interaction.reply('wait...')
        const query = interaction.options.getString('url')
        const member = interaction.guild?.members.cache.get(String(interaction.member?.user.id))
        const voiceChannel = member?.voice.channel;
        
        let player = await kazagumo.createPlayer({
            guildId: String(interaction.guild?.id),
            textId: interaction.channelId,
            voiceId: voiceChannel,
            volume: 1
        })
    }
})

kazagumo.shoukaku.on('ready', (name)=>{
    console.log(`Node ${name} is ready.`)
})
kazagumo.shoukaku.on('error', (name, error) => console.error(`Lavalink ${name}: Error Caught,`, error));
kazagumo.shoukaku.on('close', (name, code, reason) => console.warn(`Lavalink ${name}: Closed, Code ${code}, Reason ${reason || 'No reason'}`));
kazagumo.shoukaku.on('debug', (name, info) => console.debug(`Lavalink ${name}: Debug,`, info));



client.login(process.env.DISCORD_TOKEN)