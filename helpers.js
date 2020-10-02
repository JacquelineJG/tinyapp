const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);

// HELPER FUNCTIONS
//used for generating unique shortURL
const generateRandomString = () => Math.random().toString(36).substring(2,8);

const emailVerify = (obj, email) => {
  for (const user in obj) {
    const thisUser = obj[user]
    if (thisUser.email === email) {
      return true
    }
  } return null
}
const userIdByEmail = (obj, email) => {
  for (const user in obj) {
    const thisUser = obj[user]
    if (thisUser.email === email) {
      return thisUser;
    }
  }
}

const urlsForUser = (id, database) => {
  newObj = {};
  for (let url in database) {
    if (id === database[url].userID) {
      newObj[url] = database[url];
    }
  } return newObj;
 }

module.exports = { generateRandomString, emailVerify, userIdByEmail, urlsForUser }