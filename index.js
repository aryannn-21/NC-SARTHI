const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const express = require('express');
require('dotenv').config();

// Create Discord client with Guilds intent
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Configs
const OWNER_ID = '1328577531024117800';
const CHANNEL_ID = '1387518343539458150';
const cooldown = new Map();

// On bot ready
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Slash command handler
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'like') return;

    const uid = interaction.options.getString('uid');
    const region = interaction.options.getString('region');

    // Channel restriction
    if (interaction.channel.id !== CHANNEL_ID) {
        return interaction.reply({ content: 'This command is not allowed in this channel.', ephemeral: true });
    }

    // UID validation
    if (!/^\d+$/.test(uid)) {
        return interaction.reply({ content: 'UID must be numeric.', ephemeral: true });
    }

    // Region validation
    if (!/^[a-zA-Z]+$/.test(region)) {
        return interaction.reply({ content: ' Region must only contain letters.', ephemeral: true });
    }

    // Cooldown check (24h per user except owner)
    if (interaction.user.id !== OWNER_ID) {
        const lastUsed = cooldown.get(interaction.user.id);
        const now = Date.now();
        if (lastUsed && (now - lastUsed) < 86400000) {
            const timeLeft = 86400000 - (now - lastUsed);
            const hours = Math.floor(timeLeft / 3600000);
            const minutes = Math.floor((timeLeft % 3600000) / 60000);
            return interaction.reply({ content: ` Try again in ${hours}h ${minutes}m.`, ephemeral: true });
        }
        cooldown.set(interaction.user.id, now);
    }

    // Main logic
    try {
        await interaction.deferReply();
        

        const res = await axios.get(`https://noxxlikeesusano.vercel.app/like?uid=${uid}&server_name=${region}`);
        const data = res.data;

        if (data.status === 1) {
            const embed = new EmbedBuilder()
                .setTitle('✅ Likes Delivered Successfully')
                .setDescription(
                    `User: ${interaction.user}\n` +
                    `Player: ${data.PlayerNickname}\n` +
                    `UID: ${data.UID}\n` +
                    `Region: ${region}\n\n` +
                    `Likes Before: ${data.LikesbeforeCommand}\n` +
                    `Likes After: ${data.LikesafterCommand}\n` +
                    `Given Likes: ${data.LikesGivenByAPI}`
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: 'Bot by redx.highlights' })
                .setImage('https://ik.imagekit.io/258262/SkS1.jpeg?updatedAt=1753533460645')
                .setColor(0xefe9d1)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } else if (data.status === 2) {
            await interaction.editReply(' You already claimed likes for today. Try again tomorrow.');
        } else {
            await interaction.editReply(' API returned an unknown status.');
        }

    } catch (err) {
        try {
            await interaction.editReply(` An error occurred: ${err.message}`);
        } catch {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: ` An error occurred: ${err.message}`, ephemeral: true });
            }
        }
    }
});

// Express keep-alive server (for Render/Replit/Railway)
const app = express();
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(process.env.PORT || 3000, () => {
    console.log('🌐 Keep-alive Express server started.');
});

// Global error handling
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});
process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
