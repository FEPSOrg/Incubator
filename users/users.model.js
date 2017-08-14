const Promise = require("promise");
const db = require('../fepsApp-BE').db;
const messages = require('../fepsApp-BE').messages;
const pino = require('../fepsApp-BE').pino;
const findUserByUsername = function(username){
  return new Promise((resolve, reject)=>{

    const funcName = "findUserByUsername";
    pino.debug({fnction : __filename+ ">" + funcName}, "find user by username : " + username);
    db.find({selector:{"username": username}}, function(err, users) {
    		  if (!err) {
            pino.info({fnction : __filename+ ">" + funcName, user : users.docs}, "find user by username : " + username);
            return resolve(users.docs.length > 0 ? users.docs[0] : null);
          }
          reject(err);
    });
  });
};

const getUsers = function(query){

	  return new Promise((resolve, reject)=>{

		    const funcName = "get Mentors ";
		    pino.debug({fnction : __filename+ ">" + funcName}, "Find Users by " + query);
		    db.find({selector:query}, function(err, users) {
		    		  if (!err) {
		            pino.info({fnction : __filename+ ">" + funcName, user : users.docs}, "find users  : ");
		            return resolve(users.docs.length > 0 ? users.docs[0] : null);
		          }
		          reject(err);
		    });
		  });


};



exports.findUserByUsername = findUserByUsername;
exports.getUsers = getUsers ;
