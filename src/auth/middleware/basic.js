'use strict';

const base64 = require('base-64');
const User = require('../models/users.js');

module.exports = async (req, res, next) => {

  if (!req.headers.authorization) { return _authError(); }
  let basicHeader = req.headers.authorization.split(' '); 
  let encodedString = basicHeader[1];
  let [user, pass] = base64.decode(encodedString).split(':');

  try {
    req.user = await User.authenticateBasic(user, pass)
    next();
  } catch (e) {
    res.status(403).send('Invalid Login');
  }

}

