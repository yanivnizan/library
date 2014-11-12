

//var config = require('config');
var mongoose = require('mongoose');

var MONGO_USER = process.env.MONGO_USER;
var MONGO_PASSWORD = process.env.MONGO_PASSWORD;
var MONGO_URL = process.env.MONGO_URL;

mongoose.connection.on('connecting', function () {
  console.log('connecting to mongo server...');
});

mongoose.connection.on("open", function () {
  console.log("Connected to mongo server!");
});

mongoose.connection.on("error", function (err) {
  console.log("Could not connect to mongo server! error: " + err.message);
  mongoose.disconnect();
});

mongoose.connection.on('reconnected', function () {
  console.log('mongo server reconnected!');
});
mongoose.connection.on('disconnected', function () {
  console.log('mongo server disconnected!');
  mongoose.connect(MONGO_URL, { user: MONGO_USER, pass: MONGO_PASSWORD, server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } } });
  console.log("Started re-connecting on " + MONGO_URL + ", waiting for it to open...");
});

try {
  mongoose.connect(MONGO_URL, { user: MONGO_USER, pass: MONGO_PASSWORD, server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } } });
  console.log("Started connection on " + MONGO_URL + ", waiting for it to open...");
} catch (err) {
  console.log("Setting up failed to connect to " + MONGO_URL + " error: " + err.message);
}

    var projectSchema = mongoose.Schema(
        {
          _id: String,
          latest: String,
          releases: [String]
        }),
      releaseSchema = mongoose.Schema(
        {
          _id: String,
          projectId: String,
          version: String,
          filename: String,
          localFilename: String,
          added: Date
        }
      );

module.exports = {
  Project: mongoose.model('projects', projectSchema),
  Release: mongoose.model('releases', releaseSchema)
};
