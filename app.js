
// Importing required packages


const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const hbs = require('hbs');

var passport = require('passport');
var session = require('express-session');

require('dotenv').config({ path: ['.env.local', '.env'] });

const app = express();

const port = process.env.PORT || 3000;
app.set('port', port);


app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.use(session ({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.authenticate('session'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const routesDir = path.join(__dirname, 'routes');
fs.readdirSync(routesDir).forEach(route => require(path.join(routesDir, route))(app));

const server = http.createServer(app);

server.listen(port);
server.on('Listening', () => console.log(`Listening on port ${server.address().port}`));