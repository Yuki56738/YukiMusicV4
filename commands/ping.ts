import { Interaction } from "discord.js";

const { SlashCommandBuilder } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Reply with Pong!'),
    async execute(interaction: { reply: (arg0: string) => any; }){
        await interaction.reply('Pong!')
    }
}