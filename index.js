'use strict';

// Start up DB Server
require('dotenv').config();
const mongoose = require('mongoose');
const server = require('./src/server.js');
const PORT = process.env.PORT;

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

mongoose.connect(process.env.MONGODB_URI, options)
.then(()=> server.start(PORT))


