var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
var bcrypt = require('bcryptjs');
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
    secret: 'letsdosomenodeauthentication',
    name: 'operator'
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));

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