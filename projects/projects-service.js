const projectsModel = require('./projects-model');
var Promise = require('promise');
const pino = require('../fepsApp-BE').pino;
const messages = require('../fepsApp-BE').messages;
const ErrorMessage = require('../fepsApp-BE').ErrorMessage;
const Message = require('../fepsApp-BE').Message;
const validationRules = require('../fepsApp-BE').validationRules;
const CONSTANTS = require('../fepsApp-BE').constants;
const ModelUtil = require('../fepsApp-BE').ModelUtil;
const utils = require('../fepsApp-BE').utils;
const cycleService = require('../cycles/cycle-service');
exports.getProjects = function(){

    return new Promise(function(resolve,reject) {

        const funcName = "getProjects";
        pino.debug({fnction: __filename + ">" + funcName}, "Getting projects");
        //find cycle by active = true
        cycleService.getCycleByActive(true).then((response)=>{
            let query = {
                type: CONSTANTS.documents.type.projects,
                cycle: response.data[0]._id
            };
        //find project by cycle id
        ModelUtil.findByQuery(query).then((projects)=>{
              let message = new Message(Message.GETTING_DATA, projects, "");
              pino.debug({fnction : __filename+ ">" + funcName, result :projects}, "get all projects in current active cycle");
              resolve(message);
        }, (err)=>{
              let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
              pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
              reject(errorMessage);
        });
    }, (err)=>{
          let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
          pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
          reject(errorMessage);
        });

    })

  };


exports.createProject = function(projectObj, projectFounder){
  return new Promise((resolve, reject)=>{
	   const funcName = "createProject";
      pino.debug({fnction : __filename+ ">" + funcName}, "creating project");
      pino.debug({fnction : __filename+ ">" + funcName, project : projectObj});
      const currentDate = new Date().getTime();
      let cycleQuery = {
        type : CONSTANTS.documents.type.cycles,
        active : true
      };

      //Validate Cycle is active and in admission phase.
      ModelUtil.findOneByQuery(cycleQuery).then((cycle)=>{
        if(cycle){
          if(cycle.active != true){
            let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.no_active_cycle);
            return reject(errorMessage);
          }else if(cycle.currentPhase !== CONSTANTS.cycles.admission){
            let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.no_admission_cycle);
            return reject(errorMessage);
          }

          //Validate project has only 5 members, you can change in constants.json

          let memberCheck = !projectObj.members;
          if( memberCheck || projectObj.members.length > validationRules.project.members.max || projectObj.members.length < validationRules.project.members.min){
            let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.over_project_member);
            return reject(errorMessage);
          }

          //validate that members and owners has no prvious projects
          let getMemberPromises = [];
          for(let i = 0; projectObj.members && i < projectObj.members.length; i++){
            //it's cheap and I think faster since they are 5 members, to get user by id instead of getting all of them at once
            getMemberPromises.push(ModelUtil.findById(projectObj.members[i]._id));
          }


          Promise.all(getMemberPromises).then((members)=>{
            let invlovedUsers = [];

            for(let i = 0, total = members.length; i < total; i++){
              //If a suer has a project, then an error arises
              if(members[i].projects && members[i].projects.length > 0){
                let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.member_has_project);
                return reject(errorMessage);
              }
            }
            //Create project
            projectObj.type = CONSTANTS.documents.type.projects;
            projectObj.cycle = cycle._id;
            ModelUtil.insertDoc(projectObj).then((projectCreated)=>{
              let message = new Message(Message.OBJECT_CREATED, projectCreated, messages.businessMessages.project_creation_success);
              pino.debug({fnction : __filename+ ">" + funcName, project : projectCreated}, "project created successfully");
              //Update users with the users
              let project = {
                _id: projectCreated.id,
                startupName : projectObj.startupName,
                role : CONSTANTS.projects.roles.member
              };
              for(let i = 0, total = members.length; i < total; i++){
                if(members[i]._id === projectFounder._id){
                  members[i].projects = [{
                    _id: projectCreated.id,
                    startupName : projectObj.startupName,
                    role : CONSTANTS.projects.roles.founder
                  }];
                  members[i].groups = [{"id" : 3, "name" : CONSTANTS.groups.founder}];
                }else{
                  members[i].projects = [project];
                }
              }
              ModelUtil.bulkUpdates(members).then(()=>{
                pino.debug({fnction : __filename+ ">" + funcName, project : projectCreated}, "project members updated successfully with data");
                resolve(message);
              }, (err)=>{
                let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
                return reject(errorMessage);
              });
            }, (err)=>{
              let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
              pino.error({fnction : __filename+ ">" + funcName, err : err});
              return reject(err);
            });

          }, (err)=>{
            reject(err);
          });
        }else{
          let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.no_current_cycle);
          return reject(errorMessage);
        }
      });
  });
};


exports.deleteProject = function(_id,_rev, user){
  return new Promise((resolve, reject)=>{
    const funcName = "deleteProject";

    pino.debug({fnction : __filename+ ">" + funcName}, "delete project");
    pino.debug({fnction : __filename+ ">" + funcName, _id : _id, _rev : _rev});
    ModelUtil.findOneByQuery({"active" : true, type : CONSTANTS.documents.type.cycles}).then((cycle)=>{


    let groups = utils.getGroups(user);
    if(groups.includes(CONSTANTS.groups.founder) && cycle.currentPhase !== CONSTANTS.cycles.admission){
      let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.update_project_after_admission);
      reject(errorMessage);
    }

    // if( cycle.currentPhase !== CONSTANTS.cycles.revision && (!groups.includes(CONSTANTS.groups.supervisor_event) || !groups.includes(CONSTANTS.groups.supervisor_clinic) || !groups.includes(CONSTANTS.groups.supervisor_project))){
    //   let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.update_project_after_admission);
    //   reject(errorMessage);
    // }
    deleteProjectDataInMemebers(_id, _rev, user).then(()=>{
      ModelUtil.deleteDoc(_id, _rev).then((result)=>{
        let message = new Message(Message.OBJECT_REMOVED, result, messages.businessMessages.project_removed_success);
        pino.debug({fnction : __filename+ ">" + funcName, result :result}, "project is removed");
        resolve(message);
      },(err)=>{
        let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
        pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
        reject(errorMessage);
      });
    }, (err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
      reject(errorMessage);
    })
  }, (err)=>{
    reject(err)
  });
  });
};


exports.updateProjectByFounder = function(projectObj, projectFounder){
  return new Promise((resolve, reject)=>{
	   const funcName = "updateProjectByFounder";
      pino.debug({fnction : __filename+ ">" + funcName}, "creating project");
      pino.debug({fnction : __filename+ ">" + funcName, project : projectObj});
      const currentDate = new Date().getTime();
      let cycleQuery = {
        type : CONSTANTS.documents.type.cycles,
        active : true
      };

      //Validate Cycle is active and in admission phase.
      ModelUtil.findOneByQuery(cycleQuery).then((cycle)=>{
        if(cycle){
          if(cycle.active != true){
            return utils.rejectMessage(ErrorMessage.VALIDATION_ERROR,  messages.errorMessages.no_active_cycle, funcName, reject);
          }else if(cycle.currentPhase !== CONSTANTS.cycles.admission){
            return utils.rejectMessage(ErrorMessage.VALIDATION_ERROR,  messages.errorMessages.no_admission_cycle, funcName, reject);
          }

          //Validate project has only 5 members, you can change in constants.json

          let memberCheck = !projectObj.members;
          if( memberCheck || projectObj.members.length > validationRules.project.members.max || projectObj.members.length < validationRules.project.members.min){
            return utils.rejectMessage(ErrorMessage.VALIDATION_ERROR,  messages.errorMessages.over_project_member, funcName, reject);
          }

          ModelUtil.findById(projectObj._id).then((freshProject)=>{
            //get excluded memebers by comparing the projectObj from client and freshProject from databse
            let newMembers = [];
            let exisitingMembers = [];
            let excludedMembers = [];
            let jTotal = freshProject.members.length, iTotal = projectObj.members.length;

            for(let i = 0 ; i < iTotal; i++ ){
              let j = 0, isNewMember = true;
              for( ; j < jTotal; j++){
                if(projectObj.members[i]._id === freshProject.members[j]._id){
                  isNewMember = false;
                  exisitingMembers.push(projectObj.members[i]._id);
                  break;
                }
              }
              if(isNewMember){
                newMembers.push(projectObj.members[i]);
              }
            }

            //Get excluded members
            jTotal = projectObj.members.length, iTotal = freshProject.members.length;
            for(let i = 0; i < iTotal; i++ ){
              let j = 0, isExcludedMember = true;
              for( ; j < jTotal; j++){
                if(freshProject.members[i]._id === projectObj.members[j]._id){
                  isExcludedMember = false;
                  break;
                }
              }
              if(isExcludedMember){
                excludedMembers.push(freshProject.members[i]);
              }
            }

            //check excludedMembers to remove the relate project data from them

            ModelUtil.findDocsByFieldFromArray(newMembers, '_id').then((freshNewMembers)=>{
              //If a suer has a project, then an error arises
              for(let i = 0, total = freshNewMembers.length; i < total; i++){
                if(freshNewMembers[i].projects && freshNewMembers[i].projects.length > 0){
                  let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.member_has_project);
                  return reject(errorMessage);
                }
              }

              let message;
              ModelUtil.updateDoc(projectObj).then((updatedProject)=>{
                message = new Message(Message.UPDATE_OBJECT, updatedProject, messages.businessMessages.project_updated_success);
                //detatach the excluded members
                return removeProjectFromUsers(excludedMembers);
              }, (err)=>{
                return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
              }).then(()=>{
                //members are excluded
                //Add the new members
                return attachProjectToMembers(freshNewMembers, projectObj, projectFounder);
              }, (err)=>{
                reject(err);
              }).then(()=>{
                //new members has the updated project data
                resolve(message);
              }, (err)=>{
                reject(err);
              });
              }, (err)=>{
                return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
              });

          }, (err)=>{
            return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
          });
        }else{
          let errorMessage = new ErrorMessage(ErrorMessage.VALIDATION_ERROR, messages.errorMessages.no_update_project);
          return reject(errorMessage);
        }
      });
  });
};




exports.getMemberProjects = function(_id){
  return Promise((resolve, reject)=>{
    const funcName = "getMemberProjects";
    let query = {
      type : CONSTANTS.documents.type.projects,
      "members" :  {
        "$elemMatch": { "_id":  id}
      }
    };

    ModelUtil.findByQuery(query).then((projects)=>{
      let message = new Message(Message.GETTING_DATA, projects, "");
      pino.debug({fnction : __filename+ ">" + funcName, result :projects}, "get projects by member id");
      resolve(message);
    }, (err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
      reject(errorMessage);
    });
  });
}

//Delete project data in all members
const deleteProjectDataInMemebers = function(projectId, user){
  return new Promise((resolve, reject)=>{
    let funcName = "deleteProjectDataInMemebers";
    //FIXME, validation should be activated
    // let groups = utils.getGroups(user);
    //
    //   if(groups.includes(CONSTANTS.groups.founder) && cycle.currentPhase !== CONSTANTS.cycles.admission){
    //     let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, messages.errorMessages.update_project_after_admission);
    //     reject(errorMessage);
    //   }
    //
    //   if( cycle.currentPhase !== CONSTANTS.cycles.revision && !groups.includes(CONSTANTS.groups.supervisor_event) || !groups.includes(CONSTANTS.groups.supervisor_clinic) || !groups.includes(CONSTANTS.groups.supervisor_project)){
    //     let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, messages.errorMessages.update_project_after_admission);
    //     reject(errorMessage);
    //   }
      ModelUtil.findById(projectId).then((project)=>{

        //validate that members and owners has no prvious projects
        let getMemberPromises = [];
        for(let i = 0; project.members && i < project.members.length; i++){
          //it's cheap and I think faster since they are 5 members, to get user by id instead of getting all of them at once
          getMemberPromises.push(ModelUtil.findById(project.members[i]._id));
        }


        Promise.all(getMemberPromises).then((members)=>{
          for(let i = 0, total = members.length; i < total; i++){
            delete members[i].projects;
            members[i].groups = [{"id":8, "name" : CONSTANTS.groups.registered_user}];
          }
        ModelUtil.bulkUpdates(members).then(()=>{
          pino.debug({fnction : __filename+ ">" + funcName}, "Project data removed from it's members");
          resolve();
        }, (err)=>{
          let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
          return reject(errorMessage);
        });
        });
      }, (err)=>{

      });


  });
}


exports.deleteProjectDataInMemebers = deleteProjectDataInMemebers;


exports.getProjectById = function(id){
  return new Promise((resolve, reject)=>{
    const funcName = "getProjectById";
    ModelUtil.findById(id).then((project)=>{
      let message = new Message(Message.GETTING_DATA, project, "");
      pino.debug({fnction : __filename+ ">" + funcName, result :project}, "getting project by id");
      resolve(message);
    }, (err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      pino.error({fnction : __filename+ ">" + funcName, err : errorMessage});
      reject(errorMessage);
    });
  });
};
//delete any project data in the specified users
function removeProjectFromUsers(users){
  return new Promise((resolve, reject)=>{
    const funcName = 'removeProjectFromUsers';
    if(users.length === 0){
      resolve();
    }
    ModelUtil.findDocsByFieldFromArray(users).then((members)=>{
      for(let i = 0, total = members.length; i < total; i++){
        members[i].groups = [{"id":8, "name" : CONSTANTS.groups.registered_user}];
        delete members[i].projects;
      }
      ModelUtil.bulkUpdates(members).then(()=>{
        resolve();
      }, (err)=>{
        return utils.rejectMessage(ErrorMessage.DATABASE_ERROR,  err, funcName, reject);
      })
    });
  });
}

function attachProjectToMembers(members, projectObj, projectFounder){
  return new Promise((resolve, reject)=>{
    const funcName = "attachProjectToMembers";
    if(members && members.length === 0){
      resolve();
    }
    pino.debug({fnction : __filename+ ">" + funcName, project : projectObj}, "project created successfully");
    //Update users with the users
    let project = {
      _id: projectObj.id,
      startupName : projectObj.startupName,
      role : CONSTANTS.projects.roles.member
    };
    for(let i = 0, total = members.length; i < total; i++){
      if(members[i]._id === projectFounder._id){
        members[i].projects = [{
          _id: projectObj.id,
          startupName : projectObj.startupName,
          role : CONSTANTS.projects.roles.founder
        }];
        members[i].groups = [{"id" : 3, "name" : CONSTANTS.groups.founder}];
      }else{
        members[i].projects = [project];
      }
    }
    ModelUtil.bulkUpdates(members).then(()=>{
      pino.debug({fnction : __filename+ ">" + funcName}, "Project data removed from it's members");
      resolve();
    }, (err)=>{
      let errorMessage = new ErrorMessage(ErrorMessage.DATABASE_ERROR, err);
      return reject(errorMessage);
    });

  })
}
