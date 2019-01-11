
'use strict';

// import dependencies
const { connectToDatabase } = require('../services/connection.service');
const { hashPassword, checkPassword } = require('../services/bcrypt.service');
const { res } = require('../handler/res.handler');
const validator = require('validator');
const jwt = require('jsonwebtoken');

module.exports.login = async (event, context) => {

  context.callbackWaitsForEmptyEventLoop = false;
  const request = JSON.parse(event.body);
  const { username, password } = request;
  let message;

  if (!username.includes('@spartans.tech')) {
    message = "Spartans mail only";
    return res(400, { error: message })
  }

  try {

    // connect to database
    const db = await connectToDatabase();

    // ONLY SPARTANS.TECH MAIL CAN ACCESS TO CONTENT OF SITE
    const whitelistUsers = await db.collection('whitelistusers').aggregate([
      {
        $project: {
          _id: 0,
          name: 1
        }
      }
    ]).toArray();

    let spartansUsernames = [];
    // map array for checking
    whitelistUsers.map(item => {
      spartansUsernames.push(item.name);
    })

    if (!spartansUsernames.includes(username.split("@")[0])) {
      message = "You dont belong to Spartans family! Sorry :(";
      return res(400, { error: message })
    }

    // find user
    const user = await db.collection('users').find({ username }).toArray();

    // check if user exists
    if (user.length < 1) {
      message = `User does not exists!`;
      return res(400, { 'error': message });
    } else {

      // get hashed password from user
      const hashedPassword = user[0].password;

      //check password
      const isMatch = await checkPassword(password, hashedPassword);
      if (isMatch) {

        // generate access token
        const accessToken = jwt.sign({ _id: user[0]._id, username: user[0].username }, process.env.JWT_WORD);
        return res(200, { accessToken })
      } else {
        message = `Wrong password!`;
        return res(400, { 'error': message });
      }
    }
  } catch (error) {
    return res(500, { error })
  }

}

module.exports.index = async (event, context) => {

  context.callbackWaitsForEmptyEventLoop = false;
  const request = JSON.parse(event.body);
  let { username } = request;
  const { password } = request;
  username = username.trim();
  let message;

  try {

    // connect to database
    const db = await connectToDatabase();

    //check username with regex
    if (!validator.isEmail(username)) {
      message = "Invalid username / email format!";
      return res(400, { 'error': message })
    }

    if (username.includes('@spartans.tech')) {

    } else {
      console.error('Cannot login');
      return res(400, { 'error': 'not spartans' })
    }
    // ONLY SPARTANS.TECH MAIL CAN ACCESS TO CONTENT OF SITE
    const whitelistUsers = await db.collection('whitelistusers').aggregate([
      {
        $project: {
          _id: 0,
          name: 1
        }
      }
    ]).toArray();

    let spartansUsernames = [];
    // map array for checking
    whitelistUsers.map(item => {
      spartansUsernames.push(item.name);
    })

    if (!spartansUsernames.includes(username.split("@")[0])) {
      message = "You dont belong to Spartans family! Sorry :(";
      return res(400, { error: message })
    }

    //check if user exists
    // TODO delete SIGN UP
    const resultCheck = await db.collection('users').find({ username }).toArray();
    if (resultCheck.length > 0) {
      message = `User with ${username} username already exists!`;
      return res(400, { 'error': message });
    } else {
      const hashedPassword = await hashPassword(password);
      const resultCreateUser = await db.collection('users').insert({ username, password: hashedPassword });

      // generate access token
      console.log(`ops ${resultCreateUser.ops[0]}`)
      //const accessToken = jwt.sign({ _id: resultCreateUser.ops[0]._id, username: resultCreateUser.ops[0].username }, process.env.JWT_WORD);
      return res(200, { 'message': 'success registration' })
    }
  } catch (error) {
    return res(500, { error })
  }
};