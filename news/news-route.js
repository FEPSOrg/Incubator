const express = require('express');
const router = express.Router();
const newsManager = require('./news-manager');
const pino = require('../fepsApp-BE').pino;
const renderResponseUtil = require('../fepsApp-BE').renderResponseUtil;
const responseCodes = require('../fepsApp-BE').responseCodes;
const newsSchema = require('./news-schema');
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
router.get('/',(req, res, next)=>{
  let active = req.query.active;
  active = (active === "true");
  pino.debug({requestMin : req}, "Getting news");
  newsManager.getActiveNews(active).then((message)=>{
    pino.info({requestMin : req, news : message}, "Getting active news : " + active);
    res.send(message);
  },(err)=>{
    pino.error({requestMin : req, err : err}, "Getting active news : " + active);
    res.send(err);
  });
});

router.post('/', (req, res, next)=>{
  	req.checkBody(newsSchema);
    const newsObj = req.body;
	  req.getValidationResult().then(function(result) {
	    if (!result.isEmpty()) {
        let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, result.array());
        pino.error({requestMin : req, err : errorMessage}, "Creating news validation error");
	      res.status(400).json(errorMessage);
	      return;
	    }
      newsManager.addNews(newsObj).then((message)=>{
        res.json(message)
      },(err)=>{
        res.send(err);
      });
	  });
});

router.delete('/:id', (req, res)=>{
  const _rev = req.query._rev;
  const id = req.params.id;
  pino.debug({requestMin : req}, "removing news");
  newsManager.deleteNews(id, _rev).then((message)=>{
    pino.debug({requestMin : req}, "remove news");
    res.send(message);
  },(err)=>{
    pino.error({requestMin : req, err : err}, "remove news");
    res.send(err);
  });
});

router.put('/', (req, res)=>{

  const newsObj = req.body;
  newsManager.updateNews(newsObj).then((message)=>{
    res.json(message);
  },(err)=>{
    res.send(err);
  });
});
module.exports = router;
