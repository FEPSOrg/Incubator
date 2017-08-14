let app = require('../fepsApp-BE');
const ModelUtil = app.ModelUtil;
const CONSTANTS = app.constants;
const pino = app.pino;
let cache = require('memory-cache');
const Promise = require('promise');
let cacheOperations = {};
//Caching data on the application level

const refreshSectors = function(){
  return new Promise((resolve, reject)=>{
    ModelUtil.findByQuery({type : CONSTANTS.documents.type.sectors}).then((sectors)=>{
      cache.put(CONSTANTS.documents.type.sectors, sectors[0]);
      pino.info("Cached is updated, sectors are chached");
      resolve(sectors[0]);
    }, (err)=>{
      pino.error({err : err},"in caching");
      reject(err);
    });
  });
};

const refreshGroups = function(){
  return new Promise((resolve, reject)=>{
    ModelUtil.findByQuery({type : CONSTANTS.documents.type.groups}).then((result)=>{
      let groups = {};
      let groupsArray = [];
      let groupsContainer = {};
      for(let i = 0; i < result[0].data.length; i++){
        groups[result[0].data[i].name] = result[0].data[i];
        groupsArray[i] = result[0].data[i];
      }
    groupsContainer.groups = groups;
    groupsContainer.groupsArray = groupsArray;

      cache.put(CONSTANTS.documents.type.groups, groupsContainer);
      pino.info("Cached is updated, groups are chached");
      resolve(groups);
    }, (err)=>{
      pino.error({err : err},"in caching");
      reject(err);
    });
  });
}


//cache sectors
refreshSectors();
//cache groups
refreshGroups();
cacheOperations.refreshSectors = refreshSectors;
cacheOperations.refreshGroups = refreshGroups;
app.cacheOperations = cacheOperations;
