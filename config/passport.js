var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuthStrategy;

var User = require('../models/User').User;
var secret = require('./secret');

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

    // Local Strategy Sign Up
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

                    newUser.local.email = email;
                    newUser.local.password = newUser.generateHash(password);

                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }

            });
        }));

    // Local Strategy Log In
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
                    return done(null, false, {
                        loginMessage: 'User does not exists'
                    });
                if (!user.validPassword(password))
                    return done(null, false, {
                        loginMessage: 'Incorrect Password'
                    });

                return done(null, user, {
                    loginMessage: 'Login Successful'
                });
            });

        }));

    passport.use(new GoogleStrategy({
                consumerKey: secret.googleOAuth.clientId,
                consumerSecret: secret.googleOAuth.clientSecret,
                callbackURL: secret.googleOAuth.callbackUrl
            },
            function(token, tokenSecret, profile, done) {
                process.nextTick(function() {
                        User.findOne({
                            googleId: profile.id
                        }, function(err, user) {
                            if (err)
                                return done(err);

                            if (user) {
                                return done(null, user);
                            } else {
                                var newUser = new User();

                                newUser.google.id = profile.id;
                                newUser.google.token = token;
                                newUser.google.email = profile.emails[0].value; // pull the first email

                                newUser.save(function(err) {
                                    if (err)
                                        throw err;
                                    return done(null, newUser);
                                });
                                return done(err, user);
                            };
                        });
                    });
                }
            ));
    };