require('dotenv').config();
const express = require("express");
const axios = require("axios");
const mysql = require('mysql2');
const { Client, IntentsBitField, GuildMember } = require('discord.js');

  // Create a connection
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Admin123!',
    database: 'botuserinfo'
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
  interaction.user.send(`http://localhost/local/oauth/login.php?client_id=ClientId1&response_type=code&discord_id=${interaction.user.id}`);

      // Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Perform database operations here...

// Close the connection when done
connection.end((err) => {
  if (err) {
    console.error('Error closing MySQL connection:', err);
    return;
  }
  console.log('MySQL connection closed');
});





  return 0;
  }

});


client.login(process.env.TOKEN);


function setRole(role,discordID,member){
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

function setName(discordID,username){

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

}


const app = express();
const PORT = 4200;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to log when the endpoint is hit
app.use('/api/User/discord-info', (req, res, next) => {
  console.log('Received something at /api/User/discord-info');
  next(); // Pass control to the next middleware
});
const guild = client.guilds.cache.get(process.env.GUILD_ID);

// Your route handling
app.post('/api/User/discord-info', (req, res) => {

const roleFirstCourse = guild.roles.cache.find((n=> n.name === "First Course"))
const roleSecondCourse = guild.roles.cache.find((n=> n.name === "Second Course"))
const roleThirdCourse = guild.roles.cache.find((n=> n.name === "Third Course"))
const roleFourthCourse = guild.roles.cache.find((n=> n.name === "Fourth Course"))

  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const facultyNumber = req.body.faculty_number;
  const discordID = req.body.discord_id;
  const username = `${firstName} ${lastName}`;
  const member = guild.members.cache.get(discordID);

  setName(discordID,username);


  if (facultyNumber === "1") {
 
    setRole(roleFirstCourse,discordID,member);

  } else if (facultyNumber === "2"){

    setRole(roleSecondCourse,discordID,member);

  } else if (facultyNumber === "3"){

    setRole(roleThirdCourse,discordID,member);

  } else if (facultyNumber === "4"){

    setRole(roleFourthCourse,discordID,member);

  }

  console.log('Received form data:', { firstName, lastName, facultyNumber});

  // Send a response if needed
  res.send('Data received successfully!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});