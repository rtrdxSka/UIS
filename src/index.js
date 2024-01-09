const { Client, IntentsBitField, GuildMember} = require('discord.js');
const crypto = require('crypto');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const {insertIntoDiscordData,checkStudentAuth,discrordDBCheck,facultyDB,executeQuery} = require('./database.js');
const express = require("express");
const app = express();
const PORT = 4400;
const {getGuildById,checkAuth,getUser,getCourseRole,setRole,setName,removeRoles,removeBachelorRoles,syncUsers} = require('./userfunctions.js');
const {decryptFromURLSafe,registerCommands,encryptToURLSafe,bachelorRoles,masterRoles} = require('./utilites.js');
require('dotenv').config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const hash = crypto.createHash('sha256');
hash.update(process.env.secretKey);
const secretKey = hash.digest();

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.on('ready', (c) => {
  console.log(`✅ ${c.user.tag} is online.`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'auth') {
    await interaction.deferReply();

    const encryptedDiscord = encryptToURLSafe(interaction.user.id, secretKey);
    const encryptedGuild = encryptToURLSafe(interaction.guild.id, secretKey)

  interaction.user.send(`http://localhost/local/oauth/login.php?client_id=ClientId1&response_type=code&discord_id=${encryptedDiscord}&guild_id=${encryptedGuild}`);
  await interaction.editReply("Изпратен е линк за авторизация.");

  return 0;
  }else if (interaction.commandName === 'sync') {
   
    await interaction.deferReply();

    const adminRole = interaction.guild.roles.cache.find(role => role.name == "Administrator");
    if (interaction.member.roles.cache.has(adminRole.id)){
       const result = await syncUsers(interaction,client,bachelorRoles,masterRoles);
       if(result == "Success"){
        await interaction.editReply("Успешна синхронизация!");
       }
  
       
    }
    else {
      await interaction.editReply("/sync: Нямате права за тази команда!");
    }
    
  }

});

client.on('guildCreate', (guild) => {
  // When the bot joins a new server, register commands for that server
  registerCommands(guild.id, rest, Routes);
});

client.login(process.env.TOKEN);


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
  const courseNumber = req.body.course_number;
  const facultyNumber = req.body.faculty_number;
  const discordID =decryptFromURLSafe(req.body.discord_id,secretKey);
  const guildID  = decryptFromURLSafe(req.body.guild_id,secretKey);
  const degree = req.body.degree;
  const major = req.body.major;
  const username = `${firstName} ${lastName} (${courseNumber}. курс)`;



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
          

          try {
           facultyDB(major).then(name_1=>{
              console.log(`I am here and dbresult is ${name_1[0].Major}`)
              if(name_1[0].Major != myguild.name){
                console.log(`My guild name is: ${myguild.name}`)
                let roles = member.roles.cache.filter(r => r.id !== myguild.id && r.name != "Administrator"); // Get all roles except @everyone and Administrator
                member.roles.remove(roles); // Remove all roles
                console.log('Major and server do not match');
              }else{
                getCourseRole('authorized',myguild).then(role=>{
                  setRole(role,discordID,myguild);
                })
                setName(discordID,username,myguild);
               discrordDBCheck(facultyNumber).then(result =>{ 
                  if (result!=""){
                    checkStudentAuth(discordID,guildID).then(rcrdExist => {
                      if (rcrdExist==""){
                        const data = {
                          Id:null,
                          StudentId: result[0].Id,
                          DiscordId: discordID,
                          GuildId :guildID
                        };
                        insertIntoDiscordData(data);
                      }
                    })
                    

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
                  else{
                    client.users.fetch(discordID).then(user =>{
                      user.send("Проблем с аутентикацията. Моля, обърнете се към администратор на сървъра.");
                      
                    })
                  }
                  
                })
               
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








