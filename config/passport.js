var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const Promise = require("promise");
const db = require('../fepsApp-BE').db;
const messages = require('../fepsApp-BE').messages;
var crypto = require('crypto');
passport.use(new LocalStrategy({
    usernameField: 'username'
  },
  function(username, password, done) {
    db.find({selector:{"username": username}}, function(err, users) {
      if (err) { return done(err); }
      // Return if user not found in database
      let user = users.docs.length > 0? users.docs[0] : null;
      if (!user) {
        return done(null, false, {
          message: messages.errorMessages.user_not_found
        });
      }
      // Return if password is wrong
      if (!validPassword(password, user)) {
        return done(null, false, {
          message: messages.errorMessages.wrong_password
        });
      }
      // If credentials are correct, return the user object
      return done(null, user);
    });
  }
));


const validPassword = function(password, user) {
  var hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
  return user.hash === hash;
};
