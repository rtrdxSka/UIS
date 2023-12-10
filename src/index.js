require('dotenv').config();
const express = require("express");
const axios = require("axios");
const mysql = require('mysql2');
const { Client, IntentsBitField, GuildMember } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');



const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const roleNumber = {
  "First Course" : 1,
  "Second Course" : 2,
  "Third Course" : 3,
  "Fourth Course" : 4
}

const commands = [
  {
    name: 'auth',
    description: 'Gives user an auth link to moodle',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);


// function getGuildID(tableName,discordID){
//         // Create a connection
//         const connection = mysql.createConnection({
//           host: 'localhost',
//           user: 'root',
//           password: 'Admin123!',
//           database: 'botuserinfo'
//         });

//         const query = `SELECT guild_id FROM ${tableName} WHERE discord_id= ${discordID}`;

//         connection.query(query)
// }

// function userExists(tableName, data, callback) {

//     // Create a connection
//     const connection = mysql.createConnection({
//       host: 'localhost',
//       user: 'root',
//       password: 'Admin123!',
//       database: 'botuserinfo'
//     });

//   const { discord_id, guild_id } = data;
//   const query = `SELECT * FROM ${tableName} WHERE discord_id = ? AND guild_id = ?`;

//   connection.query(query, [discord_id, guild_id], (err, results) => {
//     if (err) {
//       console.error('Error checking user existence:', err);
//       return callback(err, null);
//     }

//     const userExists = results.length > 0;
//     callback(null, userExists);
//   });
// }

// function insertData(tableName, data) {

//       // Create a connection
//       const connection = mysql.createConnection({
//         host: 'localhost',
//         user: 'root',
//         password: 'Admin123!',
//         database: 'botuserinfo'
//       });

//   userExists(tableName, data, (err, exists) => {
//     if (err) {
//       console.error('Error checking user existence:', err);
//       return;
//     }

//     if (exists) {
//       console.log('User already exists. Skipping insertion.');
//       connection.end();
//     } else {
//       connection.connect((err) => {
//         if (err) {
//           console.error('Error connecting to MySQL:', err);
//           return;
//         }
//         console.log('Connected to MySQL database');

//         // SQL query to insert data into the specified table
//         const insertQuery = `INSERT INTO ${tableName} SET ?`;

//         // Execute the query with the data
//         connection.query(insertQuery, data, (err, results) => {
//           if (err) {
//             console.error('Error inserting data:', err);
//           } else {
//             console.log('Data inserted successfully. Inserted ID:', results.insertId);
//           }

//           // Close the connection when done
//           connection.end((err) => {
//             if (err) {
//               console.error('Error closing MySQL connection:', err);
//             } else {
//               console.log('MySQL connection closed');
//             }
//           });
//         });
//       });
//     }
//   });
// }

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

    
  interaction.user.send(`http://localhost/local/oauth/login.php?client_id=ClientId1&response_type=code&discord_id=${interaction.user.id}&guild_id=${interaction.guild.id}`);


//     // Example data
// const studentData = {
//   discord_id: interaction.user.id,
//   guild_id: interaction.guild.id
//   // Add other fields as needed
// };

//   insertData("user_data",studentData);



  return 0;
  }

});

client.on('guildCreate', (guild) => {
  // When the bot joins a new server, register commands for that server
  registerCommands(guild.id);
});


client.login(process.env.TOKEN);


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
// const guild = client.guilds.cache.get(process.env.GUILD_ID);

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
  const user = await myguild.members.cache.get(discordID);

  return user;
}

async function removeRoles(discordID,role,myguild){
  const roleAsNumber = roleNumber[role];
  myguild.members.fetch(discordID)
  .then(member=>{
    const allRoles = member.roles.cache;
    allRoles.forEach(element => {
      const currentRole = roleNumber[element.name];
      if(roleAsNumber < currentRole){
        member.roles.remove(element)
        console.log(`Role ${element.name} removed for ${member.user.tag}`);
      }
    });
  })
}


// Your route handling
app.post('/api/User/discord-info', (req, res) => {

  const firstName = req.body.firstname;
  const lastName = req.body.lastname;
  const facultyNumber = req.body.faculty_number;
  const discordID = req.body.discord_id;

   // Use .then to handle the asynchronous operation
   getGuildById(req.body.guild_id, client)
   .then(myguild => {
     // Continue with the rest of your code using myguild
     if (myguild) {
       res.status(200).json({ success: true });

       const username = `${firstName} ${lastName}`;
     
      //  const member = myguild.members.cache.get(discordID);

      getUser(discordID,myguild).then(member=>{
        setName(discordID,username,myguild);
     
       if (facultyNumber === "1") {
          getCourseRole("First Course",myguild).then(role =>{
          setRole(role,discordID,member,myguild);
        }) 
         removeRoles(discordID,"First Course",myguild)


       } else if (facultyNumber === "2"){
        getCourseRole("Second Course",myguild).then(role =>{
          setRole(role,discordID,member,myguild);
        })
        removeRoles(discordID,"Second Course",myguild)
         
       } else if (facultyNumber === "3"){

        getCourseRole("Third Course",myguild).then(role =>{
          setRole(role,discordID,member,myguild);
        })
        removeRoles(discordID,"Third Course",myguild)
       } else if (facultyNumber === "4"){
         getCourseRole("Fourth Course",myguild).then(role =>{
          setRole(role,discordID,member,myguild);
         })
         removeRoles(discordID,"Fourth Course",myguild)
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