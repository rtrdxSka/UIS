const crypto = require('crypto');

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



const roleNumberBachelor = {
  "Първи Курс - Бакалавър" : 1,
  "Втори Курс - Бакалавър" : 2,
  "Трети Курс - Бакалавър" : 3,
  "Четвърти Курс - Бакалавър" : 4,
  "authorized" : 0,
  "Administrator" : 0
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

const registerCommands = async (guildId, rest, Routes) => {
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
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
module.exports = {registerCommands,decryptFromURLSafe,encryptToURLSafe,delay,masterRoles,bachelorRoles,roleNumberBachelor,commands};