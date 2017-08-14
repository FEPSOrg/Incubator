var util = require('util')

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
const CONSTANTS = require('../fepsApp-BE').constants;

exports.insertAttachment = function(docObject, file){

  return new Promise((resolve, reject)=>{

    const name = docObject.name;
    const value = docObject.value;
    docObject.type = CONSTANTS.documents.type.attachments;

    // save doc
    db.insert(docObject, function(err, doc) {
      if (err) {
        let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
        reject(errorMessage);
      } else {
        existingdoc = doc;
        pino.info("New doc created ..");
        pino.info(existingdoc);
        return insertAttachment(file, existingdoc.id, existingdoc.rev, name, value, docObject).then((data)=>{
          resolve(data);
        }, (err)=>{
          reject(err);
        });
      }
    });
  });
}

exports.removeAttachement = function(id, rev){

    return new Promise((resolve, reject)=>{
      // ModelUtil.findById(_id).then((document)=>{
        //You can roles here to delete the attachement.
        // if(document.owner !== req.user.username ){
        //   let errorMessage = new ErrorMessage(ErrorMessage.UNAUTHORIZATION_ERROR, messages.errorMessages.unauthorization_error);
        //   res.send(errorMessage);
        // }
        ModelUtil.deleteDoc(id, rev).then((result)=>{
          let message = new Message(Message.OBJECT_REMOVED, result, '');
          resolve(message);
          // res.json(message);
        }, (err)=>{
          let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
          reject(errorMessage)
          // res.send(errorMessage);
        });
      // }, (err)=>{
      //   let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      //   res.send(errorMessage);
      // });
    });


}

const insertAttachment = function(file, id, rev, name, value, docObject) {
  return new Promise((resolve, reject)=>{

      fs.readFile(file.path, function(err, data) {
        if (!err && file) {
          db.attachment.insert(id, file.name, data, file.type, {
              rev: rev
          }, function(err, document) {
            if (!err) {
              pino.info('Attachment saved successfully.. ');

              db.get(document.id, function(err, doc) {
                pino.debug('Attachements from server --> ' + JSON.stringify(doc._attachments));

                var attachements = [];
                var attachData;

                for (var attachment in doc._attachments) {
                  if (attachment == value) {
                    attachData = {
                      "key": attachment,
                      "type": file.type
                    };
                  } else {
                    attachData = {
                      "key": attachment,
                      "type": doc._attachments[attachment]['content_type']
                    };
                  }
                  attachements.push(attachData);
                }

                const responseData = createResponseData(id, doc._rev, docObject, attachements);

                pino.info('Response after attachment: \n' + JSON.stringify(responseData));
                let message = new Message(Message.OBJECT_CREATED, responseData, '');
                resolve(responseData);

              });
            } else {
              let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
              reject(err);
            }
          });
        }else if(!file){
          let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, "File is mandatory");
          reject(errorMessage);
        }else{
          let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
          reject(errorMessage);
        }
      });
  });
}



function sanitizeInput(str) {
    return String(str).replace(/&(?!amp;|lt;|gt;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function createResponseData(id, rev, docObject, attachments) {

    var responseData = {
        _id: id,
        _rev: rev,
        name: sanitizeInput(docObject.name),
        value: sanitizeInput(docObject.value),
        attachements: []
    };

    attachments.forEach(function(item, index) {
        var attachmentData = {
            content_type: item.type,
            key: item.key
        };
        responseData.attachements.push(attachmentData);

    });
    return responseData;
}
