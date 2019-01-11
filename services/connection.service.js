
'use strict'

const MongoClient = require('mongodb').MongoClient;

let cachedDb = null;

function connectToDatabase() {

  if (cachedDb && cachedDb.serverConfig.isConnected()) {
    console.log('=> using cached database instance');
    return Promise.resolve(cachedDb);
  }
  const dbName = 'learning-platform';
  return MongoClient.connect(process.env.DB, { useNewUrlParser: true })
    .then(client => { cachedDb = client.db(dbName); return cachedDb; });
}

module.exports = {
  connectToDatabase
}