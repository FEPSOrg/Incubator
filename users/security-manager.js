const usersService = require('./users-service');
var Promise = require('promise');
exports.getUserByUsername = function(username){
  return new Promise((resolve, reject)=>{
    usersService.getUserByUsername(username).then((user)=>{
      resolve(user);
    },(err)=>{
      reject(err);
    });
  });
};

exports.createUser = function(userObj){
  return new Promise((resolve, reject)=>{
    usersService.createUser(userObj).then((user)=>{
      resolve(user);
    },(err)=>{
      reject(err);
    });
  });
};

exports.updateUser = function(userObj){
  return new Promise((resolve, reject)=>{
    usersService.updateUser(userObj).then((user)=>{
      resolve(user);
    },(err)=>{
      reject(err);
    });
  });
};



exports.deleteUser = function(_id, _rev){
  return new Promise((resolve, reject)=>{
    usersService.deleteUser(_id, _rev).then((result)=>{
      resolve(result);
    },(err)=>{
      reject(err);
    });
  });
};


exports.getUsersByGroups = function(groups){
	  return new Promise((resolve, reject)=>{
	    usersService.getUsersByGroups(groups).then((result)=>{
	      resolve(result);
	    },(err)=>{
	      reject(err);
	    });
	  });
	};

exports.getUserByUsernameGroup  = function(username, group){
	  return new Promise((resolve, reject)=>{
	    usersService.getUserByUsernameGroup(username, group).then((result)=>{
	      resolve(result);
	    },(err)=>{
	      reject(err);
	    });
	  });
	};

exports.getAllUsers  = function(){
    return new Promise((resolve, reject)=>{
        usersService.getAllUsers().then((result)=>{
        resolve(result);
},(err)=>{
        reject(err);
    });
});
};
