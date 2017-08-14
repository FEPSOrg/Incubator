const messages = require('../fepsApp-BE').messages;
module.exports = {

	"active" : {
		//notEmpty: true
	},
	"firstName" : {
		notEmpty: true,
		matches: {
			 options: [/^[a-zA-Z]{3,50}$/]
			}
	},
	"middleName" : {
		notEmpty: true,
			matches: {
				 options: [/^[a-zA-Z]{3,50}$/]
			}
	},
	"surname" : {
		notEmpty: true,		
			 matches: {
			 options: [/^[a-zA-Z]{3,50}$/]
			 }
		},
	"email" : {
		notEmpty: true,
		isLength: {
		      options: [{ min: 3, max: 50 }],
		      errorMessage: 'Email must be between 2 and 50 chars long'
		    },
		    isEmail: {
		        errorMessage: 'Invalid Email'
		     }
	},
	"username":{
		notEmpty: true,
		matches: {
		      options: [/^[a-zA-Z0-9]{6,30}$/] // at least one lower case
		}
	},
	"phone":{
		notEmpty: true,
		matches: {
		      options: [/^\+?(?=.*\d)[0-9]{11,16}$/] //Allows a + sign at the beginning
		}
	},
	"birthdate":{
		notEmpty: true
	},
	"gender":{
		notEmpty: true,
		isLength: {
		      options: [{ min: 1, max: 1 }],
		      errorMessage: 'Gender must be one char'
		    }
	},
	"profession":{
		notEmpty: true,
		matches: {
			 options: [/^(?=.*[a-z]*)(?=.*[A-Z]*)[a-zA-Z\s]{3,50}$/]
		}
	},
	"university":{
		notEmpty: true,
		matches: {
			options: [/^(?=.*[a-z]*)(?=.*[A-Z]*)[a-zA-Z\s]{3,50}$/]
		}
	},
	"major":{
		notEmpty: true,
		matches: {
			 options: [/^(?=.*[a-z]*)(?=.*[A-Z]*)[a-zA-Z\s]{3,50}$/]
		}
	},
	"graduationYear":{
		notEmpty: true
	},
	"linkedIn":{
		optional: true,
		matches: {
			 options: [/^http(s)?:\/\/([w]{3}\.)?linkedin\.com\/in\/([a-zA-Z0-9-]{5,30})\/?$/]
		}
	},
	"faculty":{
		optional: true,
		isLength: {
		      options: [{ min: 2, max: 500 }],
		      errorMessage: 'LinkedIn must be between 2 and500 chars long'
		    }
	},
	"areaOfExpertises":{
		optional: true,
		isLength: {
		      options: [{ min: 2, max: 500 }],
		      errorMessage: 'LinkedIn must be between 2 and500 chars long'
		    }
	},
	"sectorId":{
		optional: true //?
	},
  //not included when create, just for schema
  "groups" : {
    optional : true
  }
};
