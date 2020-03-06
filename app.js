require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const mongoose = require('mongoose');
const favicon = require('serve-favicon');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo')(session);
const PORT = process.env.PORT || 3000;
// const seedPosts = require('./seeds');
// seedPosts();

mongoose.connect('mongodb://localhost:27017/e-commerce-youtube6', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

const indexRouter = require('./routes/index');
const postRouter = require('./routes/posts');
const reviewRouter = require('./routes/reviews');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'I Love Cats',
  resave: false,
  saveUninitialized: true,
  
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.title = 'E-commerce-Elselly';
  res.locals.currentUser = req.user;

  res.locals.session = req.session;

  res.locals.success = req.session.success;
  delete req.session.success;

  res.locals.error = req.session.error;
  delete req.session.error;

  next();
});

app.use('/', indexRouter);
app.use('/posts', postRouter);
app.use('/posts/:id/reviews', reviewRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log(err);

  req.session.error = err.message;
  res.redirect('back');
});

app.listen(PORT, function(){
  console.log(`Server is on port ${PORT}`);
});