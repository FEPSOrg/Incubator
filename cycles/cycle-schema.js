module.exports = {

	"startDate" : {
		notEmpty: true
	},
	"endDate" : {
		notEmpty: true
	},
	"active" : {
		notEmpty: true
	},
	"comment" : {
		optional: true,
		isLength: {
		      options: [{ min: 2, max: 500 }],
		      errorMessage: 'Comment must be between 2 and 500 chars long'
		    }
		},
	"admissionDate" : {
		optional: true
	},
	"revisionDate" : {
		optional: true
	},
	"incubationDate" : {
		optional: true
	},
	"closureDate" : {
		optional: true
	},
	"currentPhase" : {
		optional: true
	}

};
