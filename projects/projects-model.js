const Promise = require("promise");
const db = require('../fepsApp-BE').db;
const messages = require('../fepsApp-BE').messages;
const pino = require('../fepsApp-BE').pino;

const findProject = function(query){
  return new Promise((resolve, reject)=>{

    const funcName = "findProject";
    pino.debug({fnction : __filename+ ">" + funcName, query : query}, "find project");
    db.find({selector : query}, function(err, news) {
    		  if (!err) {
            pino.info({fnction : __filename+ ">" + funcName, news : news.docs}, "find project");
            return resolve(news.docs.length > 0 ? news.docs : null);
          }
          reject(err);
    });
  });
};




exports.findProject = findProject;
