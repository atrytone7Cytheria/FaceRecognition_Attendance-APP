const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

const functions = require('firebase-functions');
const cookieParser = require('cookie-parser')();
const cors = require('cors')({ origin: true });
const https = require('https');


var admin = require("firebase-admin");
const engines = require('consolidate');

//admin.initializeApp(functions.config().firebase);
admin.initializeApp();
var SITE = "/Deploy_14Feb21";

const express = require('express');
const app = express();
var hbs = require('handlebars');
const cons = require('consolidate');

hbs.registerHelper("hasAdminAccess", function(user) {
  return vhadmin.userHasAdminAccess(user);
});

hbs.registerHelper("getTheDay", function(dateStr) {
  var date = new Date(dateStr);
  return date.getUTCDate();
});

hbs.registerHelper("total", function (oldBalance, rent, eb) {
  return parseInt(oldBalance) + parseInt(rent) + parseInt(eb);
});

hbs.registerHelper("vhabsolute", function (number) {
  return Math.abs(number);
});


hbs.registerHelper("isEqualTo", function (str1, str2) {
  return str1 === str2;
});

hbs.registerHelper("inverseUserStatus", function (val) {
  return val === "active" ? "archive" : "active";
});

hbs.registerHelper("stringyfy", function (object) {
  return JSON.stringify(object);
});

hbs.registerHelper("reverseSign", function (val) {
  return -val;
});

hbs.registerHelper("dateString", function (timestamp) {
  var refDate = new Date(+timestamp);
  return refDate.toLocaleString();
});

//NOT working yet :(((( TODO: need to figure out
hbs.registerHelper("dateStringIST", function (timestamp) {
  var refDate = new Date(+timestamp);
  refDate.setTime(refDate.getTime()+330000); //5.5 *60000
  return refDate.toLocaleString();
});

hbs.registerHelper("subtract", function (a, b) {
  return parseInt(a) - parseInt(b);
});

hbs.registerHelper('isEbRecorded', function (v1, options) {
  if (v1 === "EB_RECORDED") {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper('isdefined', function (value) {
  return value !== undefined && value !== null;
});


hbs.registerHelper('orderSuccessful', function (orderStatus) {
  return (orderStatus === "TXN_SUCCESS");
});

hbs.registerHelper('isTrue', function (boolVar, options) {
  if (boolVar === "true") {
    return options.fn(this);
  }
  return options.inverse(this);
});

hbs.registerHelper('pendingAmountGreaterThanZero', function (value) {
  return value < 0;
});


hbs.registerHelper('serialNo', function (options) {
  var currentSerialNo = options.data.root['serialNo'];
  //console.log("############Current serial No is:"+currentSerialNo);
  if (currentSerialNo === undefined) {
    currentSerialNo = 1;
  } else {
    currentSerialNo++;
  }

  options.data.root['serialNo'] = currentSerialNo;
  return currentSerialNo;
});

hbs.registerHelper('totalAmount', function (value, options) {
  var totalAmtVal = options.data.root['totalAmount'];
  //console.log("############Current serial No is:"+currentSerialNo);
  if (totalAmtVal === undefined) {
    totalAmtVal = value;
  } else {
    totalAmtVal += value;
  }

  options.data.root['serialNo'] = currentSerialNo;
  return currentSerialNo;
});


hbs.registerHelper('oddOrEven', function (options) {
  var oddOrEven = options.data.root['oddOrEven'];
  if (oddOrEven === undefined) {
    oddOrEven = "odd";
  } else if (oddOrEven === "odd") {
    oddOrEven = "even"
  } else {
    oddOrEven = "odd";
  }

  options.data.root['oddOrEven'] = oddOrEven;
  return oddOrEven;
});

app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

app.get('/', (request, response) => {
  //response.send(`${Date.now()}`);
  res.send(`Hello ${req.user.phone_number}`);
});

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async (req, res, next) => {
  //console.log('...........................................:::::::::::Check if request is authorized with Firebase ID token');

  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.');
    res.status(403).send('Unauthorized');
    //    throw Error();
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else if (req.cookies) {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    //console.log('ID Token correctly decoded', decodedIdToken);
    req.user = decodedIdToken;
    //console.log('::::::::::::::::::::::::::::::::in validateFirebaseIdToken phone number:+'+req.user.phone_number);
    next();
    return;
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(403).send('Unauthorized access');
    return;
  }
};

app.get('/admin', (req, res) => {
  res.render('attenance');
});

app.get('/stuattendance', (req, res) => {
  res.render('attenance');
});

app.get('/attendance', (req, res) => {
  res.render('attenance');
});

app.get('/myhome', (req, res) => {
  res.render('myhome');
});

const vhadmin = require('./vhadmin');

app.use(cors);
app.use(cookieParser);
app.use(validateFirebaseIdToken);

app.get('/:siteName/menu', (req, res) => {

  SITE = req.params.siteName;

  console.log('.....Retreiving menu .....SITE:' + SITE);
  // @ts-ignore
  //res.send("My Info Hello "+ JSON.stringify(req.user.phone_number));
  if (vhadmin.userHasAdminAccess(req.user))
    res.render('adminmenu', { SITE });
  else
    res.render('customermenu', { SITE });
});

exports.app = functions.https.onRequest(app);


