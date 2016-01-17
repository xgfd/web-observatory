/**
 * http://schema.org/Dataset
 * Created by xgfd on 17/12/2015.
 */

let DistributionSchema = new SimpleSchema({

    _id: {
        type: String,
        optional: true,
        autoValue(){
            //console.log(this);
            if (this.isInsert || !this.isSet) {
                return Random.id();
            }
        },
        autoform: {
            readonly: true
        }
    },

    url: {
        type: String,
        label: 'Distribution URL',
        autoform: {
            type: 'url',
            placeholder: "Provide the URL of this distribution or upload a file below"
        }
    },

    file: orion.attribute('file', {
        label: 'Upload dataset as a file.',
        optional: true
    }),

    //username: {
    //    type: String,
    //    optional: true
    //},
    //
    //pass: {
    //    type: String,
    //    optional: true
    //},

    instruction: {
        type: String,
        optional: true,
        label: 'Instruction to access this dataset'
    },

    fileFormat: {
        type: String,
        label: 'Format',
        allowedValues: ['MongoDB', 'MySQL', 'AMQP', 'SPARQL', 'HTML', 'File']
        //TODO custom validate
    },

    profile: {
        type: Object,
        optional: true,
        autoValue() {
            if (!this.isSet) {
                return {};
            }
        }
    },
    'profile.username': {
        type: String,
        optional: true,
        label: 'Dataset user name'
    },
    'profile.pass': {
        type: String,
        optional: true,
        label: 'Dataset password'
    },
    //whether this distribution is online
    online: {
        type: Boolean,
        autoform: {
            type: 'hidden',
            //omit: true,
        },
        optional: true,
        autoValue() {
            if (this.isInsert) {
                return true;
            } else if (this.isUpsert) {
                return {$setOnInsert: true};
            } else if (!this.isSet) {
                this.unset();
            } else {
                return undefined;
            }
        }
    }
});

let Dataset = {
    distribution: {
        type: [DistributionSchema],
        label: "Distribution"
    },

    datasetTimeInterval: {
        type: Object,
        label: "Time span",
        optional: true
    },

    "datasetTimeInterval.startTime": {
        type: Date,
        label: "Start",
        autoform: {
            type: "pickadate" // set to pickadate to work with materilize, check out https://github.com/djhi/meteor-autoform-materialize/
        }
    },

    "datasetTimeInterval.endTime": {
        type: Date,
        label: "End",
        autoform: {
            type: "pickadate"
        }
    },

    spatial: {
        type: String,
        label: "Spatial coverage",
        optional: true
    }
};

//_.extend(Dataset, CreativeWork);
//important, generate whitelist before constructing simpleschema
datasetWhitelist = _.filter(_.keys(Dataset), function (property) {
    return !Dataset[property].noneditable;
});

_.extend(datasetWhitelist, Whitelist);

datasetBlackList = _.filter(_.keys(Dataset), function (property) {
    return Dataset[property].noneditable;
});

_.extend(datasetBlackList, BlackList);

/* the following will cause errors;
 * new SimpleSchema(Dataset)) modifies Dataset and therefore modifies CreativeWork
 _.extend(Dataset, CreativeWork);
 Datasets.attachSchema(new SimpleSchema(Dataset));
 */
Datasets.attachSchema(new SimpleSchema([Thing, Dataset, CreativeWork]));
