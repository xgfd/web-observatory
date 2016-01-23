/**
 * Created by xgfd on 17/12/2015.
 */
SimpleSchema.debug = true;
SimpleSchema.extendOptions({
    noneditable: Match.Optional(Boolean)
});

Thing = {
    name: {
        type: String,
        unique: true,
        label: 'Name'
    },

    description: {
        type: String,
        label: 'Description',
        autoform: {type: 'textarea'}
    }
};

CreativeWork = {
    comments: orion.attribute('hasMany', {
        type: [String],
        label: 'Comments',
        // optional is true because you can have a post without comments
        optional: true,
        noneditable: true
    }, {
        collection: Comments,
        titleField: 'body',
        publicationName: 'rel_comments'
    }),

    commentsCount: {
        type: Number,
        autoValue(){
            var comments = this.field("comments");
            return comments ? comments.length : 0;
        },
        optional: true,
        autoform: {
            readonly: true
        },
        noneditable: true
    },

    creator: {
        type: String,
        label: 'Creator',
        optional: true
    },

    publisher: orion.attribute('hasOne', {
        type: String,
        label: 'publisher',
        denyUpdate: true,
        autoValue() {
            if (this.isInsert || this.isUpsert) {
                return Meteor.userId();
            } else {
                this.unset();
            }
        },
        autoform: {
            type: 'select'
            //readonly: true
        },
        noneditable: true
    }, {
        collection: Meteor.users,
        // the key whose value you want to show for each post document on the update form
        titleField: 'username',
        publicationName: 'publisher'
    }),

    // Force value to be current date (on server) upon insert
    // and prevent updates thereafter.
    datePublished: {
        type: Date,
        denyUpdate: true,
        autoform: {
            readonly: true,
            type: "pickadate"
        },
        autoValue: function () {
            if (this.isInsert || this.isUpsert) {
                return new Date();
            } else {
                this.unset(); // Prevent user from supplying their own value
            }
        }
    },

    // Force value to be current date (on server) upon update
    // and don't allow it to be set upon insert.
    dateModified: {
        type: Date,
        autoform: {
            readonly: true,
            type: "pickadate"
        },
        autoValue () {
            return new Date();
        },
        noneditable: true
    },

    isBasedOnUrl: orion.attribute('hasMany', {
        type: [String],
        label: 'Related datasets',
        optional: true
    }, {
        collection: Datasets,
        titleField: 'name',
        publicationName: 'isbasedonurl'
    }),

    keywords: {
        type: [String],
        label: 'Keywords',
        optional: true
    },

    license: {
        type: String,
        label: 'License',
        autoform: {
            options() {
                let
                    addedLices = Licenses.find();

                let options = [];
                defaultLicenses.forEach(name=> {
                    options.push({label: name.toUpperCase(), value: name});
                });

                addedLices.forEach(lice=> {
                    if (lice.name) {
                        let name = lice.name;
                        options.push({label: 'Custom license: ' + name.toUpperCase(), value: name});
                    }
                });

                return options;
            }
        }
    }
};

Mis = {
    upvoters: {
        type: [String],
        optional: true,
        autoform: {
            readonly: true
        }
    },

    votes: {
        type: Number,
        autoform: {
            readonly: true
        },
        optional: true,
        autoValue(){
            let voters = this.field('upvoters');
            return voters ? voters.length : 0;
        }
    },

    downvoters: {
        type: [String],
        optional: true,
        autoform: {
            readonly: true
        }
    },

    downvotes: {
        type: Number,
        autoform: {
            readonly: true
        },
        optional: true,
        autoValue(){
            let voters = this.field('downvoters');
            return voters ? voters.length : 0;
        }
    },

    // whether this entry is online
    // in case of a dataset, it's offline if any of its distribution is offline
    online: {
        type: Boolean,
        autoform: {
            readonly: true,
            type: 'hidden'
        },
        optional: true,
        defaultValue: true
    },

    //metadata permission i.e. visibility
    aclMeta: {
        type: Boolean,
        label: "Visible to everyone",
        defaultValue: true
    },

    //content permission i.e. queryability
    aclContent: {
        type: Boolean,
        label: "Accessible to everyone",
        defaultValue: true
    },

    //who can see this entry disregards acl settings
    metaWhiteList: orion.attribute('hasMany', {
        type: [String],
        label: 'Permitted to see',
        // optional is true because you can have a post without comments
        optional: true
    }, {
        collection: Meteor.users,
        titleField: 'username',
        publicationName: 'metawhitelist'
    }),

    //who can access this entry disregards acl settings
    contentWhiteList: orion.attribute('hasMany', {
        type: [String],
        label: 'Permitted to access',
        // optional is true because you can have a post without comments
        optional: true
    }, {
        collection: Meteor.users,
        titleField: 'username',
        publicationName: 'contentwhitelist'
    })
};

_.extend(CreativeWork, Thing);
_.extend(CreativeWork, Mis);

omitFields = "publisher, comments, commentsCount, datePublished, dateModified, upvoters, downvoters, votes, downvotes, online, distribution.$.online, distribution.$._id".split(/\s*,\s*/);
