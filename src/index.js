require('dotenv').config();
const express = require("express");
const axios = require("axios");
const { Client, IntentsBitField } = require('discord.js');


const app = express();
const PORT = 7008;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.post('https://localhost:7008/api/User/discord-info', (req, res) => {
  try {
    const userData = res.data
    console.log(`Received data: ${userData}`);


    res.status(200).send('Callback received successfully');
  } catch (error) {
    console.error('Error handling callback:', error);
    res.status(500).send('Internal Server Error');
  }
});

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', (c) => {
  console.log(`✅ ${c.user.tag} is online.`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'auth') {
  interaction.user.send(`https://localhost/local/oauth/login.php?client_id=ClientId1&response_type=code&discord_id=${interaction.user.id}`);
  return 0;
  }
});



client.login(process.env.TOKEN);