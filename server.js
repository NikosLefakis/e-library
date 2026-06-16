const express = require('express');
const app = express();
const db = require('./database/db.js');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');

app.use(cors());
app.use(express.static('frontend'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require('./router.js'));

app.listen(3000, () => {
  console.log('E-Library server running on port 3000');
});
