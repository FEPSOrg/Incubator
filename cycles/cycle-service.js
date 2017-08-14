const cycleModel = require('./cycle-model');
var Promise = require('promise');
const pino = require('../fepsApp-BE').pino;
const messages = require('../fepsApp-BE').messages;
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const Message = require('../fepsApp-BE').Message;
const ModelUtil = require('../fepsApp-BE').ModelUtil;
const CONSTANTS = require('../fepsApp-BE').constants;
const validationRules = require('../fepsApp-BE').validationRules;
const cycles_validations = CONSTANTS.cycles_validations;
exports.createCycle = function(cycleObj){
  return new Promise((resolve, reject)=>{
	   const funcName = "createCycle";
      pino.debug({fnction : __filename+ ">" + funcName}, "creating cycle");
      pino.debug({fnction : __filename+ ">" + funcName, cycle : cycleObj});
      cycleObj.type = CONSTANTS.documents.type.cycles;
      //Set default values
      // cycle is not active by default unless the super admin make it active.
      cycleObj.active = false;
      //validate only one cycle is created per date range.
      exports.getCycleByDateRange(cycleObj.startDate, cycleObj.endDate).then((cycleResult)=>{
        if(cycleResult.data && cycleResult.data.length > 0){
          let errorMessage = new ErrorMessage(ErrorMessage.ALREADY_CREATED, messages.errorMessages.already_created_cycle);
          return reject(errorMessage);
        }else{
          return ModelUtil.insertDoc(cycleObj).then((cycleCreated)=>{
            let message = new Message(Message.OBJECT_CREATED, cycleCreated, messages.businessMessages.cycle_creation_success);
            pino.debug({fnction : __filename+ ">" + funcName, cycle : cycleCreated}, "cycle created successfully");
            return resolve(message);
          }, (err)=>{
            let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
            pino.error({fnction : __filename+ ">" + funcName, err : err});
            return reject(err);
          });
        }
      },(err)=>{
        let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
        return reject(errorMessage);
      })
  });
};

exports.updateCycle = function(cycleObj){
  const funcName = "updateCycle";
  return new Promise((resolve, reject)=>{
    ModelUtil.findById(cycleObj._id).then((oldCycle)=>{

      let rules;
      if(!oldCycle.currentPhase){
        rules = cycles_validations[CONSTANTS.cycles.admission];
      }else{
        rules = cycles_validations[oldCycle.currentPhase];
      }

      if(rules.includes(cycleObj.currentPhase)){
        //deactiveate in case of closure phase
        if(cycleObj.currentPhase === CONSTANTS.cycles.closure){
          cycleObj.active = false;
        }
        ModelUtil.updateDoc(cycleObj).then((cycleResult)=>{
          pino.debug({fnction : __filename+ ">" + funcName}, "update cycle");
          pino.debug({fnction : __filename+ ">" + funcName, data: cycleObj});
          let message = new Message(Message.UPDATE_OBJECT, cycleResult, messages.businessMessages.cycle_updated_success);
          resolve(message);
        },(err)=>{
          let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
          pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
          reject(errorMessage);
        });
      }else{
        let errorMessage = new ErrorMessage(ErrorMessage.UNSUPPORTED_OPERATION, "Can't change cycle from " + oldCycle.currentPhase + " to " + cycleObj.currentPhase);
        reject(errorMessage);
      }
    }, (err)=>{
      pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
      reject(errorMessage);
    });

  });
};
exports.getCycles = function(){
	  return new Promise(function(resolve,reject){
	    const funcName = "findActiveCycle";
	    pino.debug({fnction : __filename+ ">" + funcName}, "Getting cycles");
      const query = {
        "selector": {
          "type" : CONSTANTS.documents.type.cycles,
          "startDate" : {
            "$gt" : 0
          }
        },
        "sort": [{"startDate": "desc"}],
        "limit" : 10
        };

	    ModelUtil.findByQueryOptions(query).then((cycles)=>{
	      pino.info({fnction : __filename+ ">" + funcName, cycles : cycles}, "Getting cycles");
	      let message = new Message(Message.GETTING_DATA, cycles, null);
	      resolve(message);
	    },(err)=>{
	      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
	      pino.error({fnction : __filename+ ">" + funcName, err : err});
	      reject(errorMessage);
	    });
	  });
	};

exports.getCycleById = function(id){
  return new Promise((resolve, reject)=>{
    ModelUtil.findById(id).then((cycle)=>{
      let message = new Message(Message.GETTING_DATA, cycle, null);
      resolve(message);
    }, (err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      reject(errorMessage);
    });
  });
}

exports.deleteCycle = function(_id, _rev){
	  return new Promise((resolve, reject)=>{
	    const funcName = "deleteCycle";
	    pino.debug({fnction : __filename+ ">" + funcName}, "delete cycle");
	    pino.debug({fnction : __filename+ ">" + funcName, _id : _id, _rev : _rev});
	    ModelUtil.deleteDoc(_id, _rev).then((result)=>{
	      let message = new Message(Message.OBJECT_REMOVED, result, messages.businessMessages.cycle_removed_success);
	      pino.debug({fnction : __filename+ ">" + funcName, result :result}, "cycle is removed");
	      resolve(message);
	    },(err)=>{
	      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
	      pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
	      reject(errorMessage);
	    });
	  });
	};

exports.getCycleByDateRange = function(startDate, endDate){
  return new Promise((resolve, reject)=>{
    const funcName = "getCycleByDateRange";
    let query = {
      startDate : {
        "$gte" : startDate
      },
      endDate : {
        "$lte" : endDate
      }
    };
    ModelUtil.findByQuery(query).then((cycles)=>{
      let message = new Message(Message.GETTING_DATA, cycles, null);
      resolve(message);
    },(err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
      reject(errorMessage);
    });
  });
}

exports.getCycleByDate = function(date){
  return new Promise((resolve, reject)=>{
    let funcName = "getCycleByDate";

    let query = {
      startDate : {
        "$gte" : date
      },
      endDate : {
        "$lte" : date
      }
    };
    ModelUtil.findByQuery(query).then((cycles)=>{
      let message = new Message(Message.GETTING_DATA, cycles, null);
      resolve(message);
    },(err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
      reject(errorMessage);
    });
  });
}

exports.getCycleByActive = function(active){
  return new Promise((resolve, reject)=>{
    let query = {
      selector : {
        "type" : CONSTANTS.documents.type.cycles,
        "active" : (active == true) ? true : false,
        "startDate" : {
          "$gt" : 0
        }
      },
      "sort": [{"startDate": "desc"}],
      "limit" : 10
      };
    ModelUtil.findByQueryOptions(query).then((cycles)=>{
      let message = new Message(Message.GETTING_DATA, cycles, null);
      resolve(message);
    }, (err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
      reject(errorMessage);
    });
  });
}
