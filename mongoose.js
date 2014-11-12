

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
          versions: [versionSchema]
        }),
      versionSchema = mongoose.Schema(
        {
          _id: String,
          filename: String,
          localFilename: String
        }
      );
//      dailyGameCountryAnalyticsSchema = mongoose.Schema(
//        {
//          _id: String,
//          _metadata: {},
//          revenue: Number,
//          totalEvents: Number,
//          sessions: Number,
//          avgDuration: Number
//        }),
//      dailyGameCountryDeviceFamilyAnalyticsSchema = mongoose.Schema(
//        {
//          _id: String,
//          _metadata: {},
//          revenue: Number,
//          totalEvents: Number,
//          sessions: Number,
//          avgDuration: Number
//        }),
//      dailyGameDeviceFamilyAnalyticsSchema = mongoose.Schema(
//        {
//          _id: String,
//          _metadata: {},
//          revenue: Number,
//          totalEvents: Number,
//          sessions: Number,
//          avgDuration: Number
//        }),
//      dailyUidGameAnalyticsSchema = mongoose.Schema(
//        {
//          _id: String,
//          _metadata: {},
//          startedLevels: Number,
//          completedLevels: Number,
//          endedLevels: Number,
//          completedMissions: Number,
//          revenue: Number,
//          totalEvents: Number,
//          sessions: Number,
//          avgDuration: Number,
//          brokenRecords: {}
//        }
//      ),
//      uidGameAnalyticsSchema = mongoose.Schema(
//        {
//          _id: String,
//          _metadata: {},
//          conversionStats: {},
//          buyer: Boolean,
//          startedLevels: Number,
//          completedLevels: Number,
//          endedLevels: Number,
//          completedMissions: Number,
//          revenue: Number,
//          totalEvents: Number,
//          sessions: Number,
//          avgDuration: Number
//        }
//      ),
//      socialUserSchema = mongoose.Schema(
//        {
//          _id: String,
//          _metadata: {},  // { provider: String, sUid: String }
//          lastConnected: Date
//        }
//      ),
//      deviceSchema = mongoose.Schema(
//        {
//          _id: String,
//          idfa: String,
//          platform: String,
//          deviceFamily: String,
//          countryCode: String
//        }
//      ),
//      uidSchema = mongoose.Schema(
//        {
//          devices: [String], // ["blabla", "blabla"]
//          facebook: String,
//          google: String,
//          twitter: String,
//          apple: String,
//          instagram: String
//        }
//      ),
//      uidGameStorageSchema = mongoose.Schema(
//        {
//          _id: String,
//          _metadata: {},
//          balances: {},
//          state: {},
//          other: {}
//        }
//      ),
//      environmentSchema = mongoose.Schema(
//        {
//          name: String,
//          key: String,
//          createdAt: String,
//          economyModel: {},
//          levelupModel: {},
//          fetchEconomyModel: Boolean,
//          fetchLevelUpModel: Boolean
//        }
//      ),
//      gameSchema = mongoose.Schema(
//        {
//          gameKey: String,
//          environments: [environmentSchema]  // [{ name: development, key: 389d9c8h398h, createdAt: date, models: {} }]
//        }
//      )
//      ;
//
////    balanceSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
////      return this.collection.findAndModify(query, sort, doc, options, callback);
////    };
//
//
//    return {
//      DailyGameCountryAnalytics: mongoose.model('daily_game_country_analytics', dailyGameCountryAnalyticsSchema),
//      DailyGameCountryDeviceFamilyAnalytics: mongoose.model('daily_game_country_devicefamily_analytics', dailyGameCountryDeviceFamilyAnalyticsSchema),
//      DailyGameDeviceFamilyAnalytics: mongoose.model('daily_game_devicefamily_analytics', dailyGameDeviceFamilyAnalyticsSchema),
//      DailyUidGameAnalytics: mongoose.model('daily_uid_game_analytics', dailyUidGameAnalyticsSchema),
//      UidGameAnalytics: mongoose.model('uid_game_analytics', uidGameAnalyticsSchema),
//      UidGameStorage: mongoose.model('uid_game_storages', uidGameStorageSchema),
//      Uid: mongoose.model('uids', uidSchema),
//      Device: mongoose.model('devices', deviceSchema),
//      SocialUser: mongoose.model('social_users', socialUserSchema),
//      Game: mongoose.model('games', gameSchema),
//      Event: mongoose.model('events', eventSchema)
//    };

module.exports = {
  Project: mongoose.model('projects', projectSchema)
};
