const express = require('express');
var util = require('util')
const router = express.Router();
const securityManager = require('./security-manager');
const pino = require('../fepsApp-BE').pino;
const auth = require('../fepsApp-BE').auth;
const renderResponseUtil = require('../fepsApp-BE').renderResponseUtil;
const responseCodes = require('../fepsApp-BE').responseCodes;
const usersSchema = require('./users-schema');
const SecurityUtil = require('../fepsApp-BE').securtiyUtil;
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const usersUpdateSchema = require('./usersUpdate-schema');
const Message = require('../fepsApp-BE').Message;
router.get('/', (req, res, next)=>{
  const username = req.query.username;
  let groups = req.query.groups;
  let group = req.query.group;
  if (username && group){
    pino.debug({requestMin : req}, "Getting user by username and group");
	  securityManager.getUserByUsernameGroup(username, group).then((message)=>{
	    pino.info({requestMin : req, user : message}, "Getting user by username and group : " + username + " " + group);
	    res.send(message);
	  },(err)=>{
	    pino.error({requestMin : req, err : err}, "Getting user by username and group : " + username + " " + group);
	    res.send(err);
	  });
  }else if(username){
	  pino.debug({requestMin : req}, "Getting user");
          securityManager.getUserByUsername(username).then((message)=>{
              pino.info({requestMin : req, user : message}, "Getting user by username : " + username);
                res.send(message);
                },(err)=>{
              pino.error({requestMin : req, err : err}, "Getting user by username : " + username);
              res.send(err);
          });
      //}

  }else if(groups){
	  pino.info("Getting users by groups : " + groups);
    groups = groups.replace(' ', '');
    groups = groups.split(',');
	  securityManager.getUsersByGroups(groups).then((message)=>{
		  pino.info({requestMin : req, user : message}, "Getting Mentors List : " + groups);
		    res.send(message);
		  },(err)=>{
		    pino.error({requestMin : req, err : err}, "Getting Mentors List : " + username);
		    res.send(err);
		  });
  }else{

      securityManager.getAllUsers().then((message)=>{
          pino.info({requestMin : req, user : message}, "Getting All users : ");
          res.send(message);
      },(err)=>{
          pino.error({requestMin : req, err : err}, "Getting All users : ");
          res.send(err);
      });

  }

});

router.post('/', (req, res, next)=>{


  req.checkBody(usersSchema);

  let userObj = req.body;
  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, result.array());
      pino.error({requestMin : req, err : errorMessage}, "Creating user validation error");
      res.status(400).json(errorMessage);
      return;
    }
    pino.debug({requestMin : req}, "creating user");
    securityManager.createUser(userObj).then((message)=>{
      pino.info({requestMin : req, user : message}, "Creating user");
      const token = SecurityUtil.generateJwt(userObj);
      message.token = token;
      res.send(message);
    },(err)=>{
      pino.error({requestMin : req, err : err}, "Creating user");
      res.status(400).send(err);
    });
  });


});

router.delete('/:id', auth, (req, res)=>{
  const _rev = req.query._rev;
  const id = req.params.id;
  pino.debug({requestMin : req}, "removing user");
  securityManager.deleteUser(id, _rev).then((message)=>{
    pino.debug({requestMin : req}, "remove user");
    res.send(message);
  },(err)=>{
    pino.error({requestMin : req, err : err}, "remove user");
    res.send(err);
  });
});

router.put('/', (req, res, next)=>{

	//Validate update
	  req.checkBody(usersUpdateSchema);

	  let userObj = req.body;
	   req.getValidationResult().then(function(result) {
	   if (!result.isEmpty()) {
	     res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
	     return;
	   }
	    pino.debug({requestMin : req}, "updating user");
	    securityManager.updateUser(userObj).then((message)=>{
	      pino.info({requestMin : req, user : message}, "updating user");
	      res.send(message);
	    },(err)=>{
	      pino.error({requestMin : req, err : err}, "updating user");
	      res.send(err);
	    });
	});
});

module.exports = router;
