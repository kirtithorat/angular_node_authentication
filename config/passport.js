var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuthStrategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;

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

    // Google Strategy Log In
    passport.use(new GoogleStrategy({
            consumerKey: secret.googleOAuth.clientId,
            consumerSecret: secret.googleOAuth.clientSecret,
            callbackURL: secret.googleOAuth.callbackUrl
        },
        function(token, tokenSecret, profile, done) {
            process.nextTick(function() {
                User.findOne({
                    'google.id': profile.id
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

    // Facebook Strategy Log In
    passport.use(new FacebookStrategy({
            clientID: secret.facebookOAuth.clientId,
            clientSecret: secret.facebookOAuth.clientSecret,
            callbackURL: secret.facebookOAuth.callbackURL
        },
        function(token, refreshToken, profile, done) {

            process.nextTick(function() {

                User.findOne({
                    'facebook.id': profile.id
                }, function(err, user) {

                    if (err)
                        return done(err);

                    if (user) {
                        return done(null, user);
                    } else {
                        var newUser = new User();

                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.email = profile.emails[0].value;

                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            return done(null, newUser);
                        });
                    }

                });
            });

        }));

    // Twitter Strategy Log In

    passport.use(new TwitterStrategy({
            consumerKey: secret.twitterOAuth.clientId,
            consumerSecret: secret.twitterOAuth.clientSecret,
            callbackURL: secret.twitterOAuth.callbackURL
        },
        function(token, tokenSecret, profile, done) {

            process.nextTick(function() {

                User.findOne({
                    'twitter.id': profile.id
                }, function(err, user) {

                    if (err)
                        return done(err);

                    if (user) {
                        return done(null, user);
                    } else {
                        var newUser = new User();

                        newUser.twitter.id = profile.id;
                        newUser.twitter.token = token;
                        newUser.twitter.username = profile.username;

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            });

        }));

};