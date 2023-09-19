import 'discord.js'
import { Client, Events, GatewayIntentBits } from 'discord.js'

require('dotenv').config()

console.log('hello')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
})

client.once(Events.ClientReady, c =>{
    console.log(`Logged in as: ${c.user.tag}`)
} )

client.login(process.env.DISCORD_TOKEN)