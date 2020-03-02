const mongoose = require('mongoose');
const { formatDatabaseError } = require('./formatDatabaseError');

let { ENV, DB_URL } = process.env;
console.log('=> ENV: ', ENV);
const url = NODE_ENV === 'PROD' ? DB_URL : 'mongodb://localhost:27017/calebdb';

function connectToDatabase() {
  if (mongoose.connection.readyState) {
    console.log('=> Using existing database connection...');
    return;
  }
  console.log('=> Createing new database connection...');
  console.log(`=> Connection URL: ${url}`);

  return mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .catch(error => {
      throw formatDatabaseError({ message: error.name });
    });
}

module.exports = {
  connectToDatabase
};
