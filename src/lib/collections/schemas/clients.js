/**
 * Created by xgfd on 20/01/2016.
 */
let ClientSchema = new SimpleSchema({

    name: {
        type: String,
        label: 'Name'
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
            type: 'select',
            omit: true,
            readonly: true
        },
    }, {
        collection: Meteor.users,
        // the key whose value you want to show for each post document on the update form
        titleField: 'username',
        publicationName: 'clientpublisher'
    }),

    clientSecret: {
        type: String,
        denyUpdate: true,
        autoValue(){
            if (this.isInsert || this.isUpsert) {
                return Random.id();
            } else {
                this.unset();
            }
        },
        autoform: {
            omit: true,
            readonly: true
        }
    },

    datePublished: {
        type: Date,
        denyUpdate: true,
        autoform: {
            readonly: true,
            omit: true,
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

    callbackUrl: {
        type: String,
        label: 'Callback URL',
        optional: true
    }
});

Clients.attachSchema(ClientSchema);
