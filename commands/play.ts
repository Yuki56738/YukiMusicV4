import { Interaction } from "discord.js";

const { SlashCommandBuilder } = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('音楽を再生する。'),
    async execute(interaction: { reply: (arg0: string) => any; }){
        await interaction.reply('Pong!')
    }
}