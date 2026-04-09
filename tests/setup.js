const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;

module.exports = async () => {
  // Start in-memory MongoDB instance
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // Provide teardown hook
  global.__MONGOSERVER__ = mongo;
  global.__MONGOCONN__ = mongoose;

  // After all tests, stop mongo
  const teardown = async () => {
    try { await mongoose.disconnect(); } catch (e) {}
    try { await mongo.stop(); } catch (e) {}
  };
  process.on('exit', teardown);
};
