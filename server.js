const express = require('express');
const app = express();
const db = require('./database/db.js');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const passport = require('./helpers/passport');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passportCookie = require('passport-cookie').Strategy;


app.use(cors());

app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require('./router.js'));

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
});


