const Promise = require("promise");
const db = require('../fepsApp-BE').db;
const messages = require('../fepsApp-BE').messages;
const pino = require('../fepsApp-BE').pino;

const findActiveCycle = function(query){
	  return new Promise((resolve, reject)=>{
	    const funcName = "findActiveCycle";
	    pino.debug({fnction : __filename+ ">" + funcName, query : query}, "find cycles");
	    db.find({selector : query}, function(err, cycle) {
	    		  if (!err) {
	            pino.info({fnction : __filename+ ">" + funcName, cycle : cycle.docs}, "find cycles");
	            return resolve(cycle.docs.length > 0 ? cycle.docs : null);
	          }
	          reject(err);
	    });
	  });
	};




	exports.findActiveCycle = findActiveCycle;
