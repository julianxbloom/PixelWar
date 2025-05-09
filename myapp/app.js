var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var gridRouter = require('./routes/grid');
var loginRouter = require('./routes/login');
var creditRouter = require('./routes/credits');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/grid', gridRouter);
app.use('/login', loginRouter);
app.use('/credits', creditRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Database connection & creation
var con = mysql.createConnection({
  host: "shortline.proxy.rlwy.net",
  port: "55766",
  database: "railway",
  user: "root",
  password: "UGuFIepNYGzpVrXCLKkncLTjJXsALFEe"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var user_creation = `CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT,
    username VARCHAR(100),
    pixelAvailable INT DEFAULT 7,
    lastTimeUpdate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
  )`;
  con.query(user_creation, function(err, result) {
    if (err) throw err;
    console.log("Table users created!");
  });

  con.query("SELECT * FROM name", function(err, result) {
    if (err) throw err;
    console.log(result);
  });
});

module.exports = app;
