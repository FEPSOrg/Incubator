module.exports = {
        "feedback" : {
            optional: true,
            isLength: {
                  options: [{ min: 2, max: 500 }],
                  errorMessage: 'Feedback must be between 2 and 500 chars long'
                }
        },
        "score" : {
            optional: true //double?
        },
        "cycleId" : {
            optional: true
        },
        "sectorId" : {
            optional: true
            },
        "active" : {
            // notEmpty: true //boolean or 1 char
        },
        "startupName" : {
            notEmpty: true,
            isLength: {
                  options: [{ min: 2, max: 20 }],
                  errorMessage: 'Sartup Name must be between 2 and 20 chars long'
            }
        },
        "foundingDate" : {
            notEmpty: true
        },
        "legallyRegistered" : {
            notEmpty: true,
        },
        "unregistractionReason" : {
            optional: true,
            isLength: {
                  options: [{ min: 2, max: 500 }],
                  errorMessage: 'Reason must be between 2 and 500 chars long'
                }
        },
        "businessGoals" : {
            notEmpty: true,
            isLength: {
                  options: [{ min: 2, max: 500 }],
                  errorMessage: 'Business goals must be between 2 and 500 chars long'
            }
        },
        "productService" : {
            notEmpty: true,
            isLength: {
                  options: [{ min: 2, max: 500 }],
                  errorMessage: 'Product service goals must be between 2 and 500 chars long'
            }
        },
        "currentProgress" : {
            notEmpty: true,
            isLength: {
                  options: [{ min: 2, max: 500 }],
                  errorMessage: 'Current progress must be between 2 and 500 chars long'
            }
        },
        "growthPlans" : {
            notEmpty: true,
            isLength: {
                  options: [{ min: 2, max: 500 }],
                  errorMessage: 'Growth plans must be between 2 and 500 chars long'
            }
        },
        "prototypeVideo" : {
            optional: true //video or varchar 500?
        },
        "prototypeAttachement" : {
            optional: true
        },
        "currentChallenge" : {
            notEmpty: true,
            isLength: {
                  options: [{ min: 2, max: 500 }],
                  errorMessage: 'Current challenge must be between 2 and 500 chars long'
            }
        },
        "unregisterationReason" : {
            isLength: {
                  options: [{ min: 2, max: 500 }],
                  errorMessage: 'unregisteration Reason must be between 2 and 500 chars long'
            }
        },
        "status" : {

        },
        phase : {

        }
};
