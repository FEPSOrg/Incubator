const express = require('express');
var util = require('util')
const router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const pino = require('../fepsApp-BE').pino;
const auth = require('../fepsApp-BE').auth;
const SecurityUtil = require('../fepsApp-BE').securtiyUtil;
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const Message = require('../fepsApp-BE').Message;
const db = require('../fepsApp-BE').db;
const fs = require('fs');
const ModelUtil = require('../fepsApp-BE').ModelUtil;
const attachementService = require('./attachment-service');

router.post('/',multipartMiddleware, (req, res)=>{

  const docObject = req.body;
  const name = docObject.name;
  const value = docObject.value;
  var file = req.files.file;
  attachementService.insertAttachment(docObject, file).then((data)=>{
    res.json(data);
  }, (err)=>{
    res.send(err);
  })
});

router.delete('/:_id', (req, res)=>{
  //To delete anattachement you must be the owner or something like admin
  const _id = req.params._id;
  ModelUtil.findById(_id).then((document)=>{
    //You can roles here to delete the attachement.
    // if(document.owner !== req.user.username ){
    //   let errorMessage = new ErrorMessage(ErrorMessage.UNAUTHORIZATION_ERROR, messages.errorMessages.unauthorization_error);
    //   res.send(errorMessage);
    // }
    ModelUtil.deleteDoc(document._id, document._rev).then((result)=>{
      let message = new Message(Message.OBJECT_REMOVED, result, '');
      res.json(message);
    }, (err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      res.send(errorMessage);
    });
  }, (err)=>{
    let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
    res.send(errorMessage);
  });

});

//getting attachment
router.get('/', function(request, response) {
  var doc = request.query.id;
  var key = request.query.key;

  db.attachment.get(doc, key, function(err, body) {
    if (err) {
      response.status(500);
      response.setHeader('Content-Type', 'text/plain');
      console.log(err);
      response.write('Error: ' + err);
      response.end();
      return;
    }

    response.status(200);
    response.setHeader("Content-Disposition", 'inline; filename="' + key + '"');
    response.write(body);
    response.end();
    return;
  });
});


module.exports = router;
