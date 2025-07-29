const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder()
    .setName('like')
    .setDescription('Send likes to a Free Fire UID')
    .addStringOption(option =>
      option.setName('uid')
        .setDescription('Your Free Fire UID')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('region')
        .setDescription('Region code like ind, sg, br')
        .setRequired(true))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
