'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { identifier } = require('@babel/types');
const { nextTick } = require('process');
require('dotenv').config();

const users = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Adds a virtual field to the schema. We can see it, but it never persists
// So, on every user object ... this.token is now readable!

//Added security to JWTs added in the form of expiring JWTS and newly issued variable JWTs on each login due to random generator in payload
users.virtual('token').get(function () {
  if(process.env.EXPIRES == 'true' && process.env.RANDOM == 'true'){
    let random = Math.ceil(Math.random()*100000);
    let tokenObject = jwt.sign({user: this, random: random},process.env.SECRET, { expiresIn: '1d' });
    return tokenObject;
  } else if(process.env.EXPIRES == 'true'){
    let tokenObject = jwt.sign({user: this},process.env.SECRET, { expiresIn: '1d' });
    return tokenObject;
  } else if(process.env.RANDOM == 'true'){
    let tokenObject = jwt.sign({user: this},process.env.SECRET, { expiresIn: '1d' });
    return tokenObject;
  }
  let tokenObject = jwt.sign({user: this},process.env.SECRET);
  return tokenObject;
});

users.pre('save', async function () {
  if (this.isModified(this.password)) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

// BASIC AUTH
users.statics.authenticateBasic = async function (username, password) {
  const user = await this.findOne({ username: username })
  const valid = await bcrypt.compare(password, user.password)
  if (valid) { return user; }
  else{
    throw new Error('Invalid User');
  }
}

// BEARER AUTH
users.statics.authenticateWithToken = async function (token) {
  try {
    const parsedToken = jwt.verify(token, process.env.SECRET);
    const user = this.findOne({ username: parsedToken.username })
    if (user) { 
       return {user:{_id: user._id, username: user.username}, token: token};
    };
    throw new Error("User Not Found");
  } catch (e) {
    throw new Error(e.message)
  }
}


module.exports = mongoose.model('users', users);
