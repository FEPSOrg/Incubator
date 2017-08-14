const Promise = require("promise");
const db = require('../fepsApp-BE').db;
const messages = require('../fepsApp-BE').messages;
const pino = require('../fepsApp-BE').pino;
const objectUtil = require('../fepsApp-BE').objectUtil;

exports.deleteDoc = function(_id, _rev){
  return new Promise((resolve, reject)=>{
    db.destroy(_id, _rev, function(err, result) {
      if(!err){
        return resolve(result);
      }
      reject(err);
    });
  });
};

exports.updateDoc = function(document){
  return new Promise((resolve, reject)=>{
    findById(document._id).then((freshDoc)=>{
      return updateDoc(document, freshDoc);
    }, (err)=>{
      reject(err);
    }).then((freshDoc)=>{
      resolve(freshDoc);
    }, (err)=>{
      reject(err);
    });
  });
}

//Keep track of the _rev, should use the latest _rev
const updateDoc = function(document, freshDoc){
  const funcName = "updateDoc";

  return new Promise((resolve, reject)=>{
    objectUtil.copySameTypeObject(document, freshDoc);
    db.insert(freshDoc, freshDoc._id, function(err, doc) {
       if(!err) {
         return resolve(doc);
       }
       pino.error({fnction : __filename+ ">" + funcName, err : err, "Update object" : document});
       return reject(err);
    });
  });
}


exports.insertDoc = function(documentObj){
  return new Promise((resolve, reject)=>{
    db.insert(documentObj, function(err, documentCreated) {
      if(!err){
        return resolve(documentCreated);
      }
      reject(err);
    });
  });
};

exports.findByQuery = function(query){
  return new Promise((resolve, reject)=>{
    db.find({selector: query}, function(err, data) {
		  if (!err) {
        return resolve(data.docs.length > 0 ? data.docs : null);
      }
      reject(err);
    });
  });
};

exports.findOneByQuery = function(query){
  return new Promise((resolve, reject)=>{
    db.find({selector: query}, function(err, data) {
		  if (!err) {
        return resolve(data.docs.length > 0 ? data.docs[0] : null);
      }
      reject(err);
    });
  });
};

exports.findByQueryOptions = function(query){
  return new Promise((resolve, reject)=>{
    db.find(query, function(err, data) {
          if (!err) {
            return resolve(data.docs.length > 0 ? data.docs : null);
          }
          reject(err);
    });
  });
}

exports.findDocsByFieldFromArray = function(docsArray, field){
  return new Promise((resolve, reject)=>{
    let getDocPromises = [];
    if(docsArray.length === 0){
      return resolve([]);
    }
    for(let i = 0; docsArray && i < docsArray.length; i++){
      //it's cheap and I think faster since they are 5 members, to get user by id instead of getting all of them at once
      getDocPromises.push(findById(typeof docsArray[i] === 'object'? docsArray[i][field] : docsArray[i]));
    }

    Promise.all(getDocPromises).then((members)=>{
      resolve(members);
    },(err)=>{
      reject(err);
    });
  });
}

const findById = function(_id){
  return new Promise((resolve, reject)=>{
    db.get(_id, function(err, data) {
       if(!err){
         return resolve(data);
       }
       reject(err);
    });
  });
}

exports.bulkUpdates = function(docs){
  return new Promise((resolve, reject)=>{
    db.bulk({docs:docs}, function(er) {
      if(!er) resolve();
      else reject(er);
    });
  });
}

exports.findById = findById;
