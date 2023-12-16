require('dotenv').config();
const express = require("express");
const axios = require("axios");
const mysql = require('mysql2');
const crypto = require('crypto');
const { Client, IntentsBitField, GuildMember } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

// const secretKey = crypto.randomBytes(32);

const hash = crypto.createHash('sha256');
hash.update(process.env.secretKey);
const secretKey = hash.digest();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const roleNumberBachelor = {
  "Първи Курс - Бакалавър" : 1,
  "Втори Курс - Бакалавър" : 2,
  "Трети Курс - Бакалавър" : 3,
  "Четвърти Курс - Бакалавър" : 4
}

const bachelorRoles = {
  "1" : "Първи Курс - Бакалавър",
  "2" : "Втори Курс - Бакалавър",
  "3" : "Трети Курс - Бакалавър",
  "4" :"Четвърти Курс - Бакалавър"
}

const masterRoles = {
  "1" : "Първи Курс - Магистър",
  "2" : "Втори Курс - Магистър",
  "3" : "Трети Курс - Магистър",
  "4" :"Четвърти Курс - Магистър"
}

const commands = [
  {
    name: 'auth',
    description: 'Gives user an auth link to moodle',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);


const registerCommands = async (guildId) => {
  try {
    console.log(`Registering commands for guild: ${guildId}`);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
      { body: commands },
    );
    console.log('Commands registered successfully.');
  } catch (error) {
    console.error(`Error registering commands for guild ${guildId}:`, error);
  }
};



client.on('ready', (c) => {
  console.log(`✅ ${c.user.tag} is online.`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'auth') {

    const encryptedDiscord = encryptToURLSafe(interaction.user.id, secretKey);
    const encryptedGuild = encryptToURLSafe(interaction.guild.id, secretKey)

  interaction.user.send(`http://localhost/local/oauth/login.php?client_id=ClientId1&response_type=code&discord_id=${encryptedDiscord}&guild_id=${encryptedGuild}`);

  return 0;
  }

});

client.on('guildCreate', (guild) => {
  // When the bot joins a new server, register commands for that server
  registerCommands(guild.id);
});


client.login(process.env.TOKEN);

// Encryption function
function encryptToURLSafe(text, secretKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const ivBase64 = iv.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const encryptedBase64 = encrypted.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  return `${ivBase64}:${encryptedBase64}`;
}

// Decryption function
function decryptFromURLSafe(encryptedURLSafe, secretKey) {
  const parts = encryptedURLSafe.split(':');
  const iv = Buffer.from(parts[0].replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const encryptedText = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function setRole(role,discordID,member,guild){
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

function setName(discordID,username,guild){
  console.log(discordID);
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

async function facultyDB(faculty) {
  const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 4300, // Port should be a number, not a string
    user: 'root',
    password: 'Admin123!',
    database: 'uis_student'
  });

  // Return a new Promise
  return new Promise((resolve, reject) => {
    connection.connect();

    connection.query(
      'SELECT Major FROM guilddata WHERE guildName = ?',
      [faculty],
      (error, results) => {
        connection.end(); // Make sure to end the connection after the query

        if (error) {
          reject(error); // Reject the Promise if there is an error
        } else {
          resolve(results); // Resolve the Promise with the results
        }
      }
    );
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

async function getGuildById(guildID,client) {
  try {
      const guild = await client.guilds.fetch(guildID);
      return guild;
  } catch (error) {
      console.error(`Error fetching guild: ${error.message}`);
      return null;
  }
}

async function getCourseRole(courseName,myguild) {
  try {
    let role = await myguild.roles.cache.find((n=> n.name === courseName));
    return role;
  }catch(error){
    console.error(`Error getting role: ${error.message}`);
  }
}

async function getUser(discordID,myguild){
  const user = await myguild.members.fetch(discordID);

  return user;
}

async function removeRoles(discordID,role,myguild){
  const roleAsNumber = roleNumberBachelor[role];
  myguild.members.fetch(discordID)
  .then(member=>{
    const allRoles = member.roles.cache;
    allRoles.forEach(element => {
      const currentRole = roleNumberBachelor[element.name];
      if(roleAsNumber < currentRole){
        member.roles.remove(element)
        console.log(`Role ${element.name} removed for ${member.user.tag}`);
      }
    });
  })
}

async function removeBachelorRoles(discordID,myguild){
  myguild.members.fetch(discordID)
  .then(member=>{
    const allRoles = member.roles.cache;

    allRoles.forEach(element=>{
      for (const [key, value] of Object.entries(bachelorRoles)) {
        if (element.name === value){
          member.roles.remove(element);
          console.log(`Removed bachelor role ${element.name}`);
        }
      }
    })

  })
}


// Your route handling
app.post('/api/User/discord-info', (req, res) => {

  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const facultyNumber = req.body.faculty_number;
  const discordID = decryptFromURLSafe(req.body.discord_id,secretKey);
  const guildID  = decryptFromURLSafe(req.body.guild_id,secretKey);
  const degree = req.body.degree;
  const major = req.body.major;
  const username = `${firstName} ${lastName} (${facultyNumber}. курс)`;
   // Use .then to handle the asynchronous operation
   getGuildById(guildID, client)
   .then(myguild => {
     // Continue with the rest of your code using myguild
     if (myguild) {
       res.status(200).json({ success: true });

       
     
      //  const member = myguild.members.cache.get(discordID);

      getUser(discordID,myguild).then(member=>{
        

        try {
          facultyDB(major).then(name_1=>{
            console.log(`I am here and dbresult is ${name_1[0].Major}`)
            if(name_1[0].Major != myguild.name){
              console.log(`My guild name is: ${myguild.name}`)
              let roles = member.roles.cache.filter(r => r.id !== myguild.id); // Get all roles except @everyone
              member.roles.remove(roles); // Remove all roles
              console.log('Major and server do not match');
            }else{
              setName(discordID,username,myguild);
              if(degree === "Бакалавър"){
                const role = bachelorRoles[facultyNumber];
               getCourseRole(role,myguild).then(role =>{
                setRole(role,discordID,member,myguild);
              }) 

               removeRoles(discordID,role,myguild)

              }else if(degree === "Магистър"){

                const role = masterRoles[facultyNumber];
                getCourseRole(role,myguild).then(role =>{
                  setRole(role,discordID,member,myguild);
              })
              removeBachelorRoles(discordID,myguild);
              
            }
            }
          })
         }catch(error){
          console.error(error);
         }
     
 
      })
       
       console.log('Received form data:', { firstName, lastName, facultyNumber});
     
      //  // Send a response if needed
      //  res.send('Data received successfully!');

     } else {
       res.status(404).json({ success: false, error: 'Guild not found' });
     }
   })
   .catch(error => {
     console.error(`Error in route handler: ${error.message}`);
     res.status(500).json({ success: false, error: 'Internal Server Error' });
   });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});