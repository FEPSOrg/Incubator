const pino = require('./log-config');
let config;
if(process.env.NODE_ENV === "local"){
  config = require('./local.json');
}else{

  config = require('./config.json');
}

let dbCredentials = {};

dbCredentials.url = config.cloudantNoSQLDB.credentials.url;
dbCredentials.dbName = config.cloudantNoSQLDB.dbName;

const cloudant = require('cloudant')(dbCredentials.url);

const db = cloudant.use(dbCredentials.dbName);

module.exports.db = db;
module.exports.pino = pino;
module.exports.config = config;
