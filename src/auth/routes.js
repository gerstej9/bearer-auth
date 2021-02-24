'use strict';

const express = require('express');
const authRouter = express.Router();
const bcrypt = require('bcrypt');

const User = require('./models/users.js');
const basicAuth = require('./middleware/basic.js')
const bearerAuth = require('./middleware/bearer.js')

authRouter.post('/signup', async (req, res, next) => {
  try {
    let password = req.body.password;
    let username = req.body.username;
    let encryptedPassword = await bcrypt.hash(password, 5);
    let user = new User({username: username, password: encryptedPassword});
    const userRecord = await user.save({username: username, password: encryptedPassword});
    const output = {
      user: {
        _id: userRecord._id,
        username: userRecord.username
        },
      token: userRecord.token
    };
    res.status(201).json(output);
  } catch (e) {
    next(e.message)
  }
});

authRouter.post('/signin', basicAuth, (req, res, next) => {
  const user = {
    user: req.user,
    token: req.user.token
  };
  res.status(200).json(user);
});

authRouter.get('/users', bearerAuth, async (req, res, next) => {
  const users = await User.find({});
  const list = users.map(user => user.username);
  res.status(200).json(list);
});

authRouter.get('/secret', bearerAuth, async (req, res, next) => {
  res.status(200).send("Welcome to the secret area!")
});


module.exports = authRouter;
