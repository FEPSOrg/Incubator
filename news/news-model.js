const Promise = require("promise");
const db = require('../fepsApp-BE').db;
const messages = require('../fepsApp-BE').messages;
const pino = require('../fepsApp-BE').pino;

const findNews = function(query){
  return new Promise((resolve, reject)=>{

    const funcName = "findActiveNews";
    pino.debug({fnction : __filename+ ">" + funcName, query : query}, "find news");
    db.find({selector : query}, function(err, news) {
    		  if (!err) {
            pino.info({fnction : __filename+ ">" + funcName, news : news.docs}, "find news");
            return resolve(news.docs.length > 0 ? news.docs : null);
          }
          reject(err);
    });
  });
};




exports.findNews = findNews;
