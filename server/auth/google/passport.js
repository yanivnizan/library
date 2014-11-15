var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

exports.setup = function (User, config) {
  passport.use(new GoogleStrategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL
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
            user.google = profile._json;
            user.save(function (err) {
              if (err) done(err);
              return done(err, user);
            });
          }
        });
    }
  ));
};
