const cycleService = require('./cycle-service');
const userService = require('../users/users-service');
var Promise = require('promise');
const CONSTANTS = require('../fepsApp-BE').constants;
const messages = require('../fepsApp-BE').messages;
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
exports.createCycle = function(cycleObj, userObj){
  return new Promise((resolve, reject)=>{
    //set date as numbers to make the search easy on cludant
    // cycleObj.startDate = new Date(cycleObj.startDate).getTime();
    // cycleObj.endDate = new Date(cycleObj.endDate).getTime();
    //Only Super admin is able to create cycle
    if(userService.checkUserGroup(userObj, CONSTANTS.groups.super_admin)){
      return cycleService.createCycle(cycleObj).then((result)=>{
        resolve(result);
      }, (errorMessage)=>{
        reject(errorMessage);
      });
    }else{
      let errorMessage = new ErrorMessage(ErrorMessage.UNAUTHORIZATION_ERROR, messages.errorMessages.unauthorization_error);
      reject(errorMessage);
    }

  });
};

exports.updateCycle = function(cycleObj, userObj){
  return new Promise((resolve, reject)=>{
    if(userService.checkUserGroup(userObj, CONSTANTS.groups.super_admin)){
      cycleService.updateCycle(cycleObj).then((cycleUpdated)=>{
        resolve(cycleUpdated);
      },(err)=>{
        reject(err);
      });
    }else{
      let errorMessage = new ErrorMessage(ErrorMessage.UNAUTHORIZATION_ERROR, messages.errorMessages.unauthorization_error);
      reject(errorMessage);
    }

  });
};

exports.getCycles = function(active){
  return new Promise((resolve, reject)=>{
    cycleService.getCycles(active).then((cycles)=>{
      resolve(cycles);
    },(err)=>{
      reject(err);
    });
  });
};

exports.getCycleById = function(id){
  return new Promise((resolve, reject)=>{
    cycleService.getCycleById(id).then((cycleResult)=>{
      resolve(cycleResult);
    }, (err)=>{
      reject(err);
    })
  })

}

exports.deleteCycle = function(_id,_rev){
	  return new Promise((resolve, reject)=>{
	    cycleService.deleteCycle(_id,_rev).then((result)=>{
	      resolve(result);
	    },(err)=>{
	      reject(err);
	    });
	  });
	};

exports.getCycleByDate = function(date){
  return new Promise((resolve, reject)=>{
    cycleService.getCycleByDate(date).then((result)=>{
      resolve(result);
    },(err)=>{
      reject(err);
    });
  });
}

exports.getCycleByActive = function(active){
  return new Promise((resolve, reject)=>{
    cycleService.getCycleByActive(active).then((result)=>{
      resolve(result);
    }, (err)=>{
      reject(err);
    });
  });
}
