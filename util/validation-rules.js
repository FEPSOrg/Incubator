module.exports = {

  /*cycle validation, from --> to */
  "cycles_validations" : {
    "admission" : ["Admission", "Revision"],
    "revision" : ["Revision", "Admission", "Incubation"],
    "incubation" : ["Incubation", "Revision", "Revision"],
    "closure" : ["Closure", "Incubation"]
  },
   /* 4 members + project founder*/
  "project" :{
    "members":{
      "min" : 2,
      "max" : 6
    }
  }
}
