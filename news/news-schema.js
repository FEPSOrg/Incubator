module.exports = {

	"active" : {
		notEmpty: true
	},
	"headline" : {
		notEmpty: true,
		isLength: {
		      options: [{ min: 2, max: 100 }],
		      errorMessage: 'Title must be between 2 and 100 chars long'
		    }
	},
	"storyDate":{
		notEmpty: true,
	},
	"summary" : {
		notEmpty: true,
		isLength: {
		      options: [{ min: 2, max: 100 }],
		      errorMessage: 'Summery must be between 2 and 100 chars long'
		    }
	},
	"details" : {
		notEmpty: true,
		isLength: {
		      options: [{ min: 2, max: 1000 }],
		      errorMessage: 'Details must be between 2 and 1000 chars long'
		    }
		},
	"image" : {
		// notEmpty: true,
	},
	"eventId" : {
		optional: true
	},
	"eventURL":{
		optional: true
	}

};
