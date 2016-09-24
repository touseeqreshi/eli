var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

module.exports = function(app) {
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(user, done) {
		connection.query('SELECT * FROM Users WHERE UserID = ?', [user.UserID], function(err, user) {
			if (user) {
				done(err, user);  
			}
		});
	});

	passport.use(new LocalStrategy(function(username, password, done) {
		process.nextTick(function() {
			connection.query('SELECT * FROM Users WHERE Username = ?', [username], function(err, user) {
				if (err) {
					return done(err);
				}

				if (user.length == 0) {
					return done(null, false, {
						message: 'Incorrect username.'
					});
				}

				bcrypt.compare(password, user[0].Password, function(err, res) {
					if (err) throw err;

					if ((user.length != 0) && (!res)) {
						return done(null, false, {
							message: 'Invalid password.'
						});
					}
					return done(null, user[0]);
				});
			});			
		});
	}));	
};
