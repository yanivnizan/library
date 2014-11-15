var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

exports.setup = function (User, config) {
  passport.use(new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOne({
          'email': profile.emails[0].value
        },
        function (err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            done('You are not allowed in here. Sorry :(');
          } else {
            user.name = profile.displayName;
            user.email = profile.emails[0].value;
            user.username = profile.username;
            user.facebook = profile._json;
            user.save(function (err) {
              if (err) done(err);
              return done(err, user);
            });
          }
        })
    }
  ));
};