const mongoose = require('mongoose');

const { NODE_ENV, DB_URL } = process.env;

console.log('> ENV: ', NODE_ENV);
const url =
  NODE_ENV === 'prod' || NODE_ENV === 'qa' ? DB_URL : 'mongodb://localhost:27017/calebdb';

function connectToDatabase() {
  if (mongoose.connection.readyState) {
    console.log('> Using existing DB connection...');
    return;
  }

  console.log('> Creating new database connection...');
  console.log(`> Connecting URL: ${url}`);
  return mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .catch(error => console.log(error));
}

module.exports = {
  connectToDatabase
};
