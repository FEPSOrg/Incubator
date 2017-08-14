const express = require('express');
const router = express.Router();
const cycleManager = require('./cycle-manager');
const pino = require('../fepsApp-BE').pino;
const renderResponseUtil = require('../fepsApp-BE').renderResponseUtil;
const responseCodes = require('../fepsApp-BE').responseCodes;
const cycleSchema = require('./cycle-schema');
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const SecurityUtil = require('../fepsApp-BE').securtiyUtil;
const auth = require('../fepsApp-BE').auth;
router.post('/', auth, (req, res, next)=>{
  	req.checkBody(cycleSchema);
    const cycleObj = req.body;
	  req.getValidationResult().then(function(result) {
	    if (!result.isEmpty()) {
        let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, result.array());
        pino.error({requestMin : req, err : errorMessage}, "Creating cycle validation error");
	      res.status(400).json(errorMessage);
	      return;
	    }

      cycleManager.createCycle(cycleObj, req.user).then((message)=>{
        res.json(message)
      },(err)=>{
        res.send(err);
      });
	  });
});
router.put('/', auth, (req, res)=>{

	  const cycleObj = req.body;
	  cycleManager.updateCycle(cycleObj, req.user).then((message)=>{
	    res.json(message);
	  },(err)=>{
	    res.send(err);
	  });
	});
router.get('/',(req, res, next)=>{
    let id = req.query.id;
    let active = req.query.active;
    let date = req.query.date;
    // get by id
    if(id){
      cycleManager.getCycleById(id).then((cycleResult)=>{
        pino.info({requestMin : req, news : cycleResult}, "Getting cycles by id: " + id);
        res.send(message);
      }, (err)=>{
        pino.error({requestMin : req, err : err}, "Getting cycles by id: " + id);
  	    res.send(err);
      });
    }else if(active != null && active != undefined){
    	active = (active === "true"); 
    	
      cycleManager.getCycleByActive(active).then((cycleResult)=>{
        pino.info({requestMin : req, news : cycleResult}, "Getting cycles by active: " + active);
        res.send(cycleResult);
      }, (err)=>{
        pino.error({requestMin : req, err : err}, "Getting cycles by active: " + active);
  	    res.send(err);
      });
    }else if(date){
      cycleManager.getCycleByDate(date).then((cycleResult)=>{
        pino.info({requestMin : req, news : cycleResult}, "Getting cycles by date: " + date);
        res.send(cycleResult);
      }, (err)=>{
        pino.error({requestMin : req, err : err}, "Getting cycles by date: " + date);
  	    res.send(err);
      });
    }else{
      //get the lastest 10 cycles
      pino.debug({requestMin : req}, "Getting cycles");
  	  cycleManager.getCycles().then((message)=>{
  	    pino.info({requestMin : req, news : message}, "Getting cycles");
  	    res.send(message);
  	  },(err)=>{
  	    pino.error({requestMin : req, err : err}, "Getting cycles");
  	    res.send(err);
  	  });
    }

});
router.delete('/:id', (req, res)=>{
	  const _rev = req.query._rev;
	  const id = req.params.id;
	  pino.debug({requestMin : req}, "removing cycle");
	  cycleManager.deleteCycle(id, _rev).then((message)=>{
	    pino.debug({requestMin : req}, "remove cycle");
	    res.send(message);
	  },(err)=>{
	    pino.error({requestMin : req, err : err}, "remove cycle");
	    res.send(err);
	  });
	});
	module.exports = router;
