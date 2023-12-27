require('dotenv').config();
const express = require("express");
const axios = require("axios");
const mysql = require('mysql2');
const crypto = require('crypto');
const { Client, IntentsBitField, GuildMember } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { rejects } = require('assert');

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
  "Четвърти Курс - Бакалавър" : 4,
  "authorized" : 99
}

const bachelorRoles = {
  "1" : "Първи Курс - Бакалавър",
  "2" : "Втори Курс - Бакалавър",
  "3" : "Трети Курс - Бакалавър",
  "4" :"Четвърти Курс - Бакалавър"
}

const masterRoles = {
  "1" : "Първи Курс - Магистър",
  "2" : "Втори Курс - Магистър"
}

const commands = [
  {
    name: 'auth',
    description: 'Gives user an auth link to moodle',
  },
  {
    name: 'sync',
    description: 'Syncs all users from the server'
  }
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
  }else if (interaction.commandName === 'sync') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    fetch('https://localhost:7059/api/User/DiscordSync')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
      // Process your data here
        for(let i = 0;i<data.length;i++ ) {
          executeQuery(data[i].facultyNumber,interaction.guild.id).then(result=>{
            if(result != ""){
              const username = data[i].names.split(" ").slice(0,2).join(" ");
              const degree = data[i].oks;
              console.log(JSON.stringify(result))
              for(let j=0;j<result.length;j++){
                getGuildById(interaction.guild.id,client).then(myguild=>{
                  setName(result[j].DiscordId,username,myguild);
                if(degree === "Бакалавър"){
                  const role = bachelorRoles[data[i].course];
                 getCourseRole(role,myguild).then(role =>{
                  setRole(role,result[j].DiscordId,myguild);
                }) 
  
                 removeRoles(result[j].DiscordId,role,myguild)
  
                }else if(degree === "Магистър"){
  
                  const role = masterRoles[data[i].course];
                  getCourseRole(role,myguild).then(role =>{
                    setRole(role,result[j].DiscordId,myguild);
                    
                })
                removeBachelorRoles(result[j].DiscordId,myguild);
                
              }
                })
              }
            }
          })
        }
        
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });

  }

});


client.on('guildCreate', (guild) => {
  // When the bot joins a new server, register commands for that server
  registerCommands(guild.id);
});


client.login(process.env.TOKEN);


// Async function to execute the query with parameters
// Function to execute the query with parameters using Promise
function executeQuery(facultyNumber, guildId) {
  return new Promise((resolve, reject) => {
    // Create a connection to the database
    const connection = mysql.createConnection({
      host: 'localhost',
      port: 3306, // Port should be a number, not a string
      user: 'root',
      password: 'admin',
      database: 'uis_student'
    });

    // SQL query
    const query = `
      SELECT DiscordId 
      FROM discorddata d 
      INNER JOIN students s ON d.StudentId = s.Id 
      WHERE s.Username = ? AND d.GuildId = ?;
    `;

    // Connect to the database
    connection.connect(error => {
      if (error) {
        reject('An error occurred while connecting to the DB: ' + error);
        return;
      }
      console.log('Connected to the database.');

      // Execute the query with the provided parameters
      connection.query(query, [facultyNumber, guildId], (error, results) => {
        if (error) {
          reject('An error occurred while executing the query: ' + error);
        } else {
          resolve(results);
        }
        connection.end();
      });
    });
  });
}
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

function setRole(role,discordID,guild){
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
    host: 'localhost',
    port: 3306, // Port should be a number, not a string
    user: 'root',
    password: 'admin',
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

async function discrordDBCheck(facultyNumber){
  const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306, // Port should be a number, not a string
    user: 'root',
    password: 'admin',
    database: 'uis_student'
  });

  return new Promise((resolve, reject) =>{
    connection.connect();

    connection.query(
      'SELECT Id FROM students WHERE Username = ?',
      [facultyNumber],
      (error, results) =>{
        connection.end();
  
        if(error){
          reject(error);
        }else{
          resolve(results);
        }
      }
  
    )

  })

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

function checkAuth(discordID, myguild) {
  return new Promise((resolve, reject) => {
      myguild.members.fetch(discordID)
          .then(member => {
              const allRoles = member.roles.cache;
              let isAuthorized = true;
              allRoles.forEach(element => {
                  console.log(`Role name is ${element.name}`);
                  if (element.name == "authorized") {
                      isAuthorized = false;
                  }
              });
              resolve(isAuthorized);
          })
          .catch(error => {
              reject(error); // Handle errors, such as the member not being found
          });
  });
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

function checkStudentAuth(discordID){
  const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306, // Port should be a number, not a string
    user: 'root',
    password: 'admin',
    database: 'uis_student'
  });

  return new Promise((resolve, reject) =>{
    connection.connect();

    connection.query(
      'Select GuildId from discorddata where DiscordId = ?',
      [discordID],
      (error, results) =>{
        connection.end();
  
        if(error){
          reject(error);
        }else{
          resolve(results);
        }
      }
  
    )

  })


}

// Function to insert data into discorddata table
function insertIntoDiscordData(discordData) {
  const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306, // Port should be a number, not a string
    user: 'root',
    password: 'admin',
    database: 'uis_student'
  });

  const sql = 'INSERT INTO discorddata SET ?';
  connection.query(sql, discordData, (error, results) => {
    if (error) {
      console.error('Error occurred:', error);
      return;
    }
    console.log('Insert successful:', results);
  });
}

// Your route handling
app.post('/api/User/discord-info', (req, res) => {
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const courseNumber = req.body.course_number;
  const facultyNumber = req.body.faculty_number;
  const discordID = decryptFromURLSafe(req.body.discord_id,secretKey);
  const guildID  = decryptFromURLSafe(req.body.guild_id,secretKey);
  const degree = req.body.degree;
  const major = req.body.major;
  const username = `${firstName} ${lastName} (${courseNumber}. курс)`;

// discrordDBCheck(facultyNumber).then(resultDB=>{
// if (resultDB != ""){
//   DBdata = {
//     "Id": null,
//     "StudentId": resultDB[0].Id,
//     "DiscordId" : discordID,
//     "GuildId": guildID
//   };



  // insertIntoDiscordData(DBdata);

   // Use .then to handle the asynchronous operation
   getGuildById(guildID, client)
   .then(myguild => {
     // Continue with the rest of your code using myguild
     if (myguild) {
       res.status(200).json({ success: true });


     checkAuth(discordID,myguild).then(checker=>{
      if(checker){
        console.log(`Checker inside program ${checker}`)
        getUser(discordID,myguild).then(member=>{
          getCourseRole('authorized',myguild).then(role=>{
            setRole(role,discordID,myguild);
          })

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
                  const role = bachelorRoles[courseNumber];
                 getCourseRole(role,myguild).then(role =>{
                  setRole(role,discordID,myguild);
                }) 
  
                 removeRoles(discordID,role,myguild)
  
                }else if(degree === "Магистър"){
  
                  const role = masterRoles[courseNumber];
                  getCourseRole(role,myguild).then(role =>{
                    setRole(role,discordID,myguild);
                })
                removeBachelorRoles(discordID,myguild);
                
              }
              }
            })
           }catch(error){
            console.error(error);
           }
       
   
        })
      }else{
        console.log("User is Authorized");
      }
     })
      //  const member = myguild.members.cache.get(discordID);

 
       
       console.log('Received form data:', { firstName, lastName, facultyNumber: courseNumber});
     
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