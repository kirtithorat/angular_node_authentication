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
                    return done(null, false, {
                        signupMessage: 'Email is already taken'
                    });
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
            console.log("I am here");
            User.findOne({
                email: email
            }, function(err, user) {
                if (err)
                    return done(err);
                console.log("********user:"+user)
                if (!user)
                    return done(null, false, {
                        loginMessage: 'User does not exists'
                    });
                console.log("*******!user.validPassword(password):"+user.validPassword(password));
                if (!user.validPassword(password))
                    return done(null, false, {
                        loginMessage: 'Incorrect Password'
                    });

                return done(null, user, {
                    loginMessage: 'Login Successful'
                });
            });

        }));
};