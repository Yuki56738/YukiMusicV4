// import 'discord.js'
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js'
declare module "discord.js" {
    export interface Client {
      commands: Collection<any, any>;
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

client.commands = new Collection();



client.once(Events.ClientReady, c =>{
    console.log(`Logged in as: ${c.user.tag}`)
} )

client.login(process.env.DISCORD_TOKEN)