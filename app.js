var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const expressHbs = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var ariclesRouter = require('./routes/articles');
var adminRouter = require('./routes/admin');
var articlesRouterApi = require('./api/articles');

var app = express();

// view engine setup
app.engine('.hbs', expressHbs.engine({ defaultLayout: 'layout', extname: '.hbs' }));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'News?!',
  saveUninitialized: false,
  resave: false
}));
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost/newsapp', (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("successfully connected to database");
  }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/articles', ariclesRouter);
app.use('/admin', adminRouter);
app.use('/api/articles', articlesRouterApi);

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
  res.render('404');
});

module.exports = app;
