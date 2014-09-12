var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
var passport = require('passport');
var session = require('express-session');

// models
var User = require('./models/User').User;

var app = express();

mongoose.connect(configDB.url);
require('./config/passport')(passport);

app.set('port', process.env.PORT || 3000);
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

//passport
app.use(session({
    secret: 'letsdosomenodeauthentication'
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {

    // Website you wish to allow to connect
    res.header('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.header('Access-Control-Allow-Credentials', true);

    // Request headers you wish to allow
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Access-Control-Allow-Origin');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    }


});

app.use(express.static(path.join(__dirname, 'public')));

// Local Strategy Routes
app.post('/api/login', passport.authenticate('local-login'), function(req, res) {
    res.cookie('user', JSON.stringify(req.user));
    res.send(req.user); // Always req.user and NOT req.member or req.operator (not based on model name)
});


app.post('/api/signup', passport.authenticate('local-signup'), function(req, res) {
    res.cookie('user', JSON.stringify(req.user));
    res.send(req.user); // req.user and NOT req.operator
});

// Google Strategy Routes
app.get('/auth/google/', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// callback after google has authenticated the user
app.get('/google/oauth2callback',
    passport.authenticate('google'));

app.get('/api/logout', function(req, res, next) {
    req.logout();
    res.send(200);
});

app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email'
}));

// handle the callback after facebook has authenticated the user
app.get('/facebook/oauth2callback',
    passport.authenticate('facebook'));


// Google Strategy Routes
app.get('/auth/twitter', passport.authenticate('twitter'));

// callback after google has authenticated the user
app.get('/twitter/oauth2callback',
    passport.authenticate('twitter'));

// To fix Cannot GET /route on hitting Refresh with Angular
app.get('*', function(req, res) {
    res.redirect('/#' + req.originalUrl);
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send(500, {
        message: err.message
    });
});

app.listen(app.get('port'), function() {
    console.log('Express server started listening on port ' + app.get('port'));
});