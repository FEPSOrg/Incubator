const express = require('express');
const router = express.Router();
const projectManager = require('./project-manager');
const pino = require('../fepsApp-BE').pino;
const renderResponseUtil = require('../fepsApp-BE').renderResponseUtil;
const responseCodes = require('../fepsApp-BE').responseCodes;
const projectSchema = require('./projects-schema');
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const auth = require('../fepsApp-BE').auth;
router.get('/',(req, res, next)=>{

  pino.debug({requestMin : req}, "Getting Projects");
  projectManager.getProjects().then((message)=>{
    pino.info({requestMin : req, projects : message}, "Getting projects");
    res.send(message);
  },(err)=>{
    pino.error({requestMin : req, err : err}, "Getting projects");
    res.send(err);
  });
});

router.get('/:id', (req, res)=>{

  const id = req.params.id;
  pino.debug({requestMin : req}, "Getting Projects by id: " + id);

  projectManager.getProjectById(id).then((projectResult)=>{
    pino.info({requestMin : req, news : projectResult}, "Getting projectby id");
    res.send(projectResult);
  }, (err)=>{
    pino.error({requestMin : req, err : err}, "Getting project by id: " + id);
    res.send(err);
  });
});

router.post('/', auth,(req, res, next)=>{
  	req.checkBody(projectSchema);
    const projectObj = req.body;
	  // req.getValidationResult().then(function(result) {
	  //   if (!result.isEmpty()) {
    //     let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, result.array());
    //     pino.error({requestMin : req, err : errorMessage}, "Creating project validation error");
	  //     res.status(400).json(errorMessage);
	  //     return;
	  //   }
      projectManager.createProject(projectObj, req.user).then((message)=>{
        res.json(message);
      },(err)=>{
        res.send(err);
      });
	  // });
});

router.delete('/:id', auth, (req, res)=>{
  const rev = req.query.rev;
  const id = req.params.id;
  pino.debug({requestMin : req}, "removing project");
  projectManager.deleteProject(id, rev, req.user).then((message)=>{
    pino.debug({requestMin : req}, "remove project");
    res.send(message);
  },(err)=>{
    pino.error({requestMin : req, err : err}, "remove project");
    res.send(err);
  });
});

router.put('/', auth,(req, res, next)=>{
  	req.checkBody(projectSchema);
    const projectObj = req.body;
	  // req.getValidationResult().then(function(result) {
	  //   if (!result.isEmpty()) {
    //     let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, result.array());
    //     pino.error({requestMin : req, err : errorMessage}, "Creating project validation error");
	  //     res.status(400).json(errorMessage);
	  //     return;
	  //   }
      projectManager.updateProject(projectObj, req.user).then((message)=>{
        res.json(message)
      },(err)=>{
        res.send(err);
      });
	  // });
});
module.exports = router;
