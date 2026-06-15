const passport = require('passport');
const passportCookie = require('passport-cookie').Strategy;

passport.use(new passportCookie((username, password, done) => {
  User.findOne({username:username,password:password}, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { message: 'Incorrect username or password.' });
    }
    return done(null, user);
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;