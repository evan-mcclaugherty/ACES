require('dotenv').config()
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var cors = require('cors');
var helmet = require('helmet');

var multer = require('multer');
let upload = multer({
  dest: __dirname + '/profile'
});


var sassMiddleware = require('node-sass-middleware');
var messages = require('./middleware/messages');
var userMiddleware = require('./middleware/user');
var auth = require('./middleware/auth');

process.on('uncaughtException', function (e) {
  console.error(e);
});

var index = require('./routes/index');
var register = require('./routes/register');
var login = require('./routes/login');
var users = require('./routes/usersRoute');
var games = require('./routes/gamesRoute');
var chat = require('./routes/chat');
var profile = require('./routes/profile');

var app = express();
app.use(helmet());
app.use(cors());

var server = require('http').Server(app);
require('./chat/chatServer').listen(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', 1);

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: [process.env.ONE, process.env.TWO, process.env.THREE],
  maxAge: 5 * 24 * 60 * 60 * 1000,
  sameSite: 'strict',
  // secure: true,
  // domain: 'aces-game-hub.herokuapp.com'
}));

app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true,
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(messages());
app.use(userMiddleware());

app.get('/', index);
app.get('/register', register.form);
app.post('/register', upload.single('user[photo]'), register.validate, register.submit);
app.get('/login', login.form);
app.post('/login', login.validate, login.submit);
app.get('/logout', login.logout);

//auth routes
app.use(auth());
app.get('/games', games.get);
app.get('/addGame', games.getaddGame);
app.post('/addGame', upload.single('game[photo]'), games.validate, games.postAddGame);
app.post('/addLike/:title', games.addLike);
app.post('/removeLike/:title', games.removeLike);
app.get('/games/:title', games.singleGame);
app.post('/games/winner', upload.array(), games.winner);

app.get('/users', users.get);

app.get('/profile', profile.get);
app.get('/chat', chat.get);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {
  app,
  server
};