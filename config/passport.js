var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/User').User;

module.exports = function(passport) {
    // serialize the user
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done) {

            User.findOne({
                email: email
            }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {
                    return done(null, false, req.flash('signupMessage', 'Email is already taken'));
                } else {

                    var newUser = new User();

                    newUser.email = email;
                    newUser.password = newUser.generateHash(password);

                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }

            });
        }));

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true 
        },
        function(req, email, password, done) { 

            User.findOne({
                email: email
            }, function(err, user) {
                if (err)
                    return done(err);

                if (!user)
                    return done(null, false, req.flash('loginMessage', 'User does not exists')); 

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Incorrect Password')); 

                return done(null, user, req.flash('loginMessage', 'Login Successful'));
            });

        }));

};