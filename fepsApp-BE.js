var express = require('express');
var path = require('path');
var sass = require('node-sass-middleware');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt = require('express-jwt');
var multipart = require('connect-multiparty')
const expressValidator = require('express-validator');
require('dotenv').config({path: './config/.env'});

var config = exports.config = require('./config');
var messages = exports.config = require('./util/app-messages.json');
const CONSTANTS = require('./util/constants.json') ;
const validationRules = require('./util/validation-rules');
const renderResponseUtil = require('./util/RenderResponseUtil');
const responseCodes = require('./util/response-codes.json');
const ErrorMessage = require('./util/customMessage').ErrorMessage;
const Message = require('./util/customMessage').Message;
const SecurityUtil = require('./util/SecurityUtil');
const ObjectUtil = require('./util/ObjectUtil');

let app = express();


app.db = config.db;
app.pino = config.pino;
app.messages = messages;
app.ErrorMessage = ErrorMessage;
app.Message = Message;
app.constants = CONSTANTS;
app.validationRules = validationRules;
app.objectUtil = ObjectUtil;
app.renderResponseUtil = renderResponseUtil;
app.responseCodes = responseCodes;
app.securtiyUtil = SecurityUtil;
module.exports = app;
const ModelUtil = require('./util/ModelUtil');
app.ModelUtil = ModelUtil;
const utils = require('./util/Utils');
app.utils = utils;
var auth = jwt({
  secret: process.env.JWT_KEY,
  userProperty: 'payload'
});
app.auth = auth;
require('./config/passport');
const MailUtil = require('./util/MailUtils')(config.config.mails);
app.mailUtil = MailUtil;
module.exports = app;
require('./cache');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.bodyParser({ extended: true }));
app.use(expressValidator());

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(sass({
	src: path.join(__dirname, '/public/sass'),
	dest: path.join(__dirname, '/public/css'),
	outputStyle: 'expanded',
	debug: true,
	prefix: '/css'
}));

//this line must be under sass definition
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
	  res.header("Access-Control-Allow-Origin", "*");
	  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Apikey");
	  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, OPTION, PUT, PATCH, DELETE');
	  next();
	});
app.use(express.static(path.join(__dirname, 'public')));
app.get("/fepsIncubator/*",(req,res)=>{
	res.render(__dirname+'/public/index.html');
});
var cors = require("cors");
app.use(cors());
//Decode jwt token and store the user object in req.user, if token is exist
app.use((req, res, next)=>{
  SecurityUtil.decodeJWT(req, res, next);
  // next();
});
module.exports = app;

//Declaring routes
const lookups = require('./lookups/lookups-route');
const authRoute = require('./auth/authentication');
const  usersRoute = require('./users/users.route.js');
const newsRoute = require('./news/news-route.js');
const projectsRoute = require('./projects/project-route');
const cycleRoute= require('./cycles/cycle-route.js');
const attachementsRoute = require('./attachments/attachements-route');
app.get('/status', (req, res)=>{
  res.send({"server" : "up and running"});
});

// Declare routes
app.use('/', authRoute);
app.use('/users', usersRoute);
app.use('/news', newsRoute);
app.use('/projects', projectsRoute);
app.use('/lookups', lookups);
app.use('/cycles', cycleRoute);
app.use('/attachements', attachementsRoute);
// a middleware with no mount path; gets executed for every request to the app


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
    console.log(err);
    res.send(err);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err);
  res.send(err);
});


module.exports = app;
// Testing sending emails
// MailUtil.sendEmail(CONSTANTS.mail.contact, CONSTANTS.mailTemplates.contact, "My subject",{"some" : "data"}, CONSTANTS.language.en, "elbassel.n13@gmail.com").then((info)=>{
//   console.log(info);
// }, (err)=>{
//   console.log(err);
// });
