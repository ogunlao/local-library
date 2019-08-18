const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog');  //Import routes for "catalog" area of site

const app = express();

//Set up mongoose connection
const mongoose = require('mongoose');
const mongoDB = 'mongodb://127.0.0.1:27017/local_library';
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Require handlebars and just-handlbars-helpers
const hbs = require('hbs');
// Helper for select tag in handlebar
hbs.registerHelper('option', function (value, label, selectedValue) {
  var selectedProperty = value == selectedValue ? 'selected="selected"' : '';
  return new hbs.SafeString('<option value="' + value + '"' + selectedProperty + '>' + label + "</option>");
});
const H = require('just-handlebars-helpers');

// Register just-handlebars-helpers with handlebars
H.registerHelpers(hbs);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('view options', { layout: 'layouts/layout' });

hbs.registerPartials(__dirname + '/views/partials');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

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
