const crypto = require('crypto');
let cache = require('memory-cache');
const usersModel = require('./users.model');
const Promise = require('promise');
const pino = require('../fepsApp-BE').pino;
const messages = require('../fepsApp-BE').messages;
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const Message = require('../fepsApp-BE').Message;
const CONSTANTS = require('../fepsApp-BE').constants;
const securtiyUtil = require('../fepsApp-BE').securtiyUtil;
const ModelUtil = require('../fepsApp-BE').ModelUtil;
exports.getUserByUsername = function(username){
  return new Promise(function(resolve,reject){
    const funcName = "getUserByUsername";
    const query = {"username" : username};
    pino.debug({fnction : __filename+ ">" + funcName}, "Getting user by username : " + username);
    usersModel.getUsers(query).then((user)=>{
      if(user){
        delete user.hash;
        delete user.salt;
      }
      pino.info({fnction : __filename+ ">" + funcName, user : user}, "Getting user by username : " + username);
      let message = new Message(Message.GETTING_DATA, user, null);
      resolve(message);
    },(err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : err});
      reject(errorMessage);
    });
  });
};

exports.getUsersByGroups = function(groups){
	return new Promise((resolve, reject)=>{
    const funcName = "getUsersByGroups";
		let query = {
			type : CONSTANTS.documents.type.users,
			"groups" :  {
				"$elemMatch": { "name":  {"$in": groups}}
			}
		};
    pino.debug({fnction : __filename+ ">" + funcName}, "Getting user by groups : " + groups);
		ModelUtil.findByQuery(query).then((users)=>{
      if(users){
        for(let i =0; i < users.length; i++){
          delete users[i].hash;
          delete users[i].salt;
        }
      }
      pino.debug({fnction : __filename+ ">" + funcName}, "Result of getting user by groups : " + users);
			resolve(users);
		}, (err)=>{
			reject(err);
		});
	});
}

exports.getUserByUsernameGroup = function(username, group){
  return new Promise((resolve, reject)=>{
    let funcName = "getUserByUsernameGroup";
    let query = {
      type : CONSTANTS.documents.type.users,
      "username" : username,
      "groups" :  {
        "$elemMatch": { "name":  group}
      }
    };
    ModelUtil.findByQuery(query).then((users)=>{
      if(users){
        for(let i =0; i < users.length; i++){
          delete users[i].hash;
          delete users[i].salt;
        }
      }
      pino.debug({fnction : __filename+ ">" + funcName}, "Result of getting user by groups : " + users);
			resolve(users?users[0] : null);
		}, (err)=>{
			reject(err);
		});

  });
}
exports.createUser = function(userObj){
  return new Promise((resolve, reject)=>{
    const funcName = "createUser";
    //check if username, email, phone is exist
    let query = {
      "$or": [
        { "email": userObj.email },
        { "phone": userObj.phone },
        { "username" : userObj.username}
      ]
    };

    ModelUtil.findByQuery(query).then((users)=>{
      if(users){
        let errorMessages = [];
        let usernameErrorExist, phoneErrorExist, emailErrorExist;

        for(let i = 0; i < users.length; i ++){
          if(users[i].username === userObj.username & !usernameErrorExist){
            errorMessages.push(new ErrorMessage(ErrorMessage.VALIDATION_ERROR,messages.errorMessages.username_already_exist));
            usernameErrorExist = true;
          }
          if(users[i].phone === userObj.phone && !phoneErrorExist){
            errorMessages.push(new ErrorMessage(ErrorMessage.VALIDATION_ERROR,messages.errorMessages.phone_already_exist));
            phoneErrorExist = true;
          }
          if(users[i].email === userObj.email && !emailErrorExist){
            errorMessages.push(new ErrorMessage(ErrorMessage.VALIDATION_ERROR,messages.errorMessages.email_already_exist));
            emailErrorExist = true;
          }
          if(usernameErrorExist && emailErrorExist && phoneErrorExist){
            break;
          }
        }
        return reject(errorMessages);
      }
      pino.debug({fnction : __filename+ ">" + funcName}, "creating user");

      userObj = securtiyUtil.setPassword(userObj, userObj.password);
      //Do not save password directly in DB, we save hash instead.

      delete userObj.password;

      userObj.type = CONSTANTS.documents.type.users;
      let groups = cache.get(CONSTANTS.documents.type.groups);
      userObj.groups = [groups.groups[CONSTANTS.groups.registered_user]];
      userObj.active = true;
      ModelUtil.insertDoc(userObj).then((createdUser)=>{
        let message = new Message(Message.USER_CREATED, createdUser, messages.businessMessages.user_register_success);
        pino.debug({fnction : __filename+ ">" + funcName, user : createdUser}, "User created successfully");
        resolve(message);
      }, (err)=>{
        let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
        pino.error({fnction : __filename+ ">" + funcName, err : err});
        return reject(err);
      });

    },(err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : err});
      return reject(err);
    });

  });
};

exports.updateUser = function(userObj){
  return new Promise((resolve, reject)=>{

      //remove password fields if exist
      delete userObj.password;
      const funcName = "updateUser";

      ModelUtil.updateDoc(userObj).then((updatedDoc)=>{

          ModelUtil.findById(updatedDoc.id).then((updatedUser)=>{
              let message = new Message(Message.UPDATE_OBJECT, updatedUser, messages.businessMessages.user_update_success);
              pino.debug({fnction : __filename+ ">" + funcName, user : updatedUser}, "User updated successfully");
              resolve(message);
           },(err)=>{
              let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
              pino.error({fnction : __filename+ ">" + funcName, err : err});
              return reject(err);
          });

      }, (err)=>{
        let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
        pino.error({fnction : __filename+ ">" + funcName, err : err});
        return reject(err);
      });
  });
}

exports.deleteUser = function(_id, _rev){
  return new Promise((resolve, reject)=>{
    const funcName = "deleteUser";
    pino.debug({fnction : __filename+ ">" + funcName}, "delete user");
    pino.debug({fnction : __filename+ ">" + funcName, _id : _id, _rev : _rev});
    ModelUtil.deleteDoc(_id, _rev).then((result)=>{
      let message = new Message(Message.OBJECT_REMOVED, result, messages.businessMessages.user_removed);
      pino.debug({fnction : __filename+ ">" + funcName, result :result}, "user is removed");
      resolve(message);
    },(err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : err});
      reject(err);
    });
  });
};

exports.checkUserGroup = function(userObj, group){
  if(!userObj || !group){
    throw new Error('userObj and group must be objects');
  }

  for(let i = 0; userObj.groups && i < userObj.groups.length; i++){
    if(userObj.groups[i].name === group){
      return true;
    }
  }
  return false;
}


const setPassword = function(userObj, password){
  userObj.salt = crypto.randomBytes(16).toString('hex');
  userObj.hash = crypto.pbkdf2Sync(password, userObj.salt, 1000, 64, 'sha512').toString('hex');
};


exports.getMentors = function(){
	  return new Promise(function(resolve,reject){
	    const funcName = "get Mentor List";
	    const query = "{\"groups.name\":"+"mentor}";

	    pino.debug({fnction : __filename+ ">" + funcName}, "Getting Mentors List : " );
	    usersModel.getUsers(query).then((result)=>{
	      pino.info({fnction : __filename+ ">" + funcName, result : result}, "Getting mentors List: ");
	   //   let message = new Message(Message.GETTING_DATA, result, null);
	      resolve(result);
	    },(err)=>{
	      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
	      pino.error({fnction : __filename+ ">" + funcName, err : err});
	      reject(errorMessage);
	    });
	  });
	};

exports.getAllUsers = function(){
    return new Promise((resolve,reject)=>{
        const funcName = "getAllUsers";
        const query = {type : CONSTANTS.documents.type.users};
        pino.debug({fnction : __filename+ ">" + funcName}, "Getting all users");
        ModelUtil.findByQuery(query).then((users)=>{
          //remove password
        if(users){
            for(let i =0; i < users.length; i++){
                delete users[i].hash;
                delete users[i].salt;
            }
        }
        pino.info({fnction : __filename+ ">" + funcName, users : users}, "Getting all users : ");
        let message = new Message(Message.GETTING_DATA, users, null);
        resolve(message);
    },(err)=>{
            let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
            pino.error({fnction : __filename+ ">" + funcName, err : err});
            reject(errorMessage);
        });
    });
};
