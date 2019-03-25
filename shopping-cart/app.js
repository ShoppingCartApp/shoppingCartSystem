var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs = require('express-handlebars');
const cookieSession = require('cookie-session');
var session = require('express-session');
var flash = require('connect-flash');
var SqliteStore = require('connect-sqlite3')(session);

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
/** 
app.use(session({
  store: new SqliteStore,
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 7*24*60*60*1000} // 1 week
}));
*/
app.use(cookieSession({
  name: 'session',
  //keys: ['key1', 'key2'],
  secret: 'foo'
}));
app.use(express.static(path.join(__dirname, 'public')));

// router set up
app.use('/', indexRouter);

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

module.exports = app;
