const serializers = require('../log-serializers/serializers');
const config = {
  name: "FEBS",
  stream: process.stdout,
  serializers: {
      requestMax: serializers.requestMax,
      requestMin: serializers.requestMin,
      fnction: serializers.fnction
  }
};

if(process.NODE_ENV){
  level : process.NODE_ENV === "production"? "info" : "debug";
  config.level = level;
}

const pino = require('pino')(config);

module.exports = pino;
