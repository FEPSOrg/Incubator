const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const pino = require('../fepsApp-BE').pino;
module.exports = {
  getGroups : function(user){
    let groups = [];
    for(let i = 0, total = user.groups; i < user.groups.length; i++){
      groups.push(user.groups[i].name);
    }
    return groups;
  },
  //example of calling, return utils.rejectMessage(ErrorMessage.VALIDATION_ERROR,  messages.errorMessages.no_active_cycle, funcName, reject);
  rejectMessage : function(errorCode, err, funcName, reject){
    let errorMessage = new ErrorMessage(errorCode, err);
    pino.error({fnction : __filename+ ">" + funcName, err : err});
    return reject(err);
  }
};
