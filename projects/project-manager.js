const projectService = require('./projects-service');
var Promise = require('promise');
exports.getProjects = function(active){
  return new Promise((resolve, reject)=>{
    projectService.getProjects({}).then((projects)=>{
      resolve(projects);
    },(err)=>{
      reject(err);
    });
  });
};

exports.createProject = function(projectObj, projectFounder){
  return new Promise((resolve, reject)=>{
    projectService.createProject(projectObj, projectFounder).then((createdProject)=>{
      resolve(createdProject);
    },(err)=>{
      reject(err);
    });
  });
};

exports.deleteProject = function(_id, _rev, user){
  return new Promise((resolve, reject)=>{

    projectService.deleteProject(_id, _rev, user).then((result)=>{
      resolve(result);
    },(err)=>{
      reject(err);
    });
  });
}

exports.updateProject = function(projectObj, projectFounder){
  return new Promise((resolve, reject)=>{
    projectService.updateProjectByFounder(projectObj, projectFounder).then((projectUpdated)=>{
      resolve(projectUpdated);
    },(err)=>{
      reject(err);
    });
  });
}

exports.getProjectById = function(id){
  return new Promise((resolve, reject)=>{
    projectService.getProjectById(id).then((projectResult)=>{
      resolve(projectResult);
    }, (err)=>{
      reject(err);
    });
  });

}
