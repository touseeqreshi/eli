var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

//local authentication strategies
require('./passport.js')(app);

var routes = require('./routes/index');
var users = require('./routes/users');
var students = require('./routes/students');
var semesters = require('./routes/semesters');
var webforms = require('./routes/webforms');
var verifications = require('./routes/verifications');
var reports = require('./routes/reports');
var tools = require('./routes/tools');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(session({ 
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/students', students);
app.use('/semesters', semesters);
app.use('/webforms', webforms);
app.use('/verifications', verifications);
app.use('/reports', reports);
app.use('/tools', tools);


//connect to mysql database
var mysql = require("mysql");
//make connection a global variable
connection = mysql.createConnection({
  host: "tviw6wn55xwxejwj.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "bop7yvld7w5mu7l5",
  password: "jx4tgef1odp9ie7h",
  database: "c1hgc7522xdpfe66"
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});

app.set('connection', connection);

/*connection.end(function(err) {
  // The connection is terminated gracefully
  // Ensures all previously enqueued queries are still
  // before sending a COM_QUIT packet to the MySQL server.
});*/

app.get('/login', function(req, res) {
  if (req.session.hasOwnProperty('okay_message')) {
    var okay_message = req.session.okay_message;
    delete req.session.okay_message;
  }
  if (req.session.hasOwnProperty('error_message')) {
    var error_message = req.session.error_message;
    delete req.session.error_message;
  }

  res.render('login', {
    title: 'Login',
    okay_message: okay_message || null,
    error_message: error_message || null
  });
});

app.post('/login', passport.authenticate('local', {failureRedirect: '/loginFailure'}), function(req, res) {
  req.session.save(function (err) {
    if (err) {
      return next(err);
    }
    req.session.okay_message = "You have logged in the system scuccessfully!";
    res.redirect(req.session.returnTo || '/');
    delete req.session.returnTo;
  });
});

app.get('/loginFailure', function(req, res, next) {
  req.session.error_message = 'Incorrect <strong>username</strong> and(or) <strong>password</strong>, please re-enter your username and passowrd.';
  res.redirect('/login');
});

app.get('/logout', function(req, res) {
  req.logout();
  req.session.okay_message = "You have logged out from the system."
  res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;