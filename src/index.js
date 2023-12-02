require('dotenv').config();
const express = require("express");
const axios = require("axios");
const { Client, IntentsBitField, GuildMember } = require('discord.js');


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
  interaction.user.send(`http://localhost/local/oauth/login.php?client_id=ClientId1&response_type=code&discord_id=${interaction.user.id}`);
  return 0;
  }
});


client.login(process.env.TOKEN);


const app = express();
const PORT = 4200;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to log when the endpoint is hit
app.use('/api/User/discord-info', (req, res, next) => {
  console.log('Received something at /api/User/discord-info');
  next(); // Pass control to the next middleware
});

// Your route handling
app.post('/api/User/discord-info', (req, res) => {


  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const facultyNumber = req.body.faculty_number;
  const discordID = req.body.discord_id;
  const username = `${firstName} ${lastName}`;
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  const role = guild.roles.cache.get("1180542074488102972");
  const member = guild.members.cache.get(discordID);

  guild.members.fetch(discordID)
  .then(member => {
    // Check if the member is found
    if (member) {
      // Change the username (nickname) of the member
      member.setNickname(username)
        .then(() => {
          console.log(`Changed username to ${username} for user ${member.user.tag}`);
        })
        .catch(error => {
          console.error(`Error changing username: ${error}`);
        });
      }
    });



  if (facultyNumber === "1") {
    // Fetch the member asynchronously
    guild.members.fetch(discordID)
      .then(member => {
        // Check if the member is found
        if (member) {
          // Add the role to the member
          member.roles.add(role)
            .then(() => {
              console.log(`Added role ${role.name} to user ${member.user.tag}`);
            })
            .catch(error => {
              console.error(`Error adding role: ${error}`);
            });
        } else {
          console.error(`Member not found with ID: ${discordID}`);
        }
      })
      .catch(error => {
        console.error(`Error fetching member: ${error}`);
      });
  }

  console.log('Received form data:', { firstName, lastName, facultyNumber});

  // Send a response if needed
  res.send('Data received successfully!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});