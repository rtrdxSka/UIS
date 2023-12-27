const {executeQuery} = require('./database.js');
const {roleNumberBachelor} = require('./utilites.js');

async function syncUsers(interaction,client,bachelorRoles,masterRoles){
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

  module.exports = {removeBachelorRoles,checkAuth,removeRoles,getUser,getCourseRole,getGuildById,setName,setRole,syncUsers};