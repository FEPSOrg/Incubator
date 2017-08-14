const GROUPS = require('../util/constants.json').groups;
const DOCUMENTS = require('../util/constants.json').documents.type;

module.exports ={
  "type" : DOCUMENTS.groups,
  "data" : [
    {"id": 1, "name" : GROUPS.super_admin, /*set views here as view1 : true, view2 : false*/},
    {"id": 2, "name" : GROUPS.it_admin},
    {"id": 3, "name" : GROUPS.supervisor_event},
    {"id": 4, "name" : GROUPS.supervisor_project},
    {"id": 5, "name" : GROUPS.supervisor_clinic},
    {"id": 6, "name" : GROUPS.founder},
    {"id": 7, "name" : GROUPS.mentor},
    {"id": 8, "name" : GROUPS.registered_user}
  ]
};


console.log(module.exports);
