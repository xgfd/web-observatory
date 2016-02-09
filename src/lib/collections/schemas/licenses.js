/**
 * Created by xgfd on 22/01/2016.
 */

let LicenseSchema = new SimpleSchema({
    name: {
        type: String,
        label: 'License name'
    },
    url: {
        type: String,
        label: 'License URL',
        autoform: {
            type: 'url'
        },
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
            type: 'select',
            readonly: true,
            omit: true
        },
        noneditable: true
    }, {
        collection: Meteor.users,
        // the key whose value you want to show for each post document on the update form
        titleField: 'username',
        publicationName: 'licepublisher'
    }),
    text: {
        type: String,
        label: 'License content',
        autoform: {
            type: 'textarea'
        },
        optional: true
    },
    datePublished: {
        type: Date,
        denyUpdate: true,
        autoform: {
            readonly: true,
            omit: true,
            type: "bootstrap-datepicker"
        },
        autoValue: function () {
            if (this.isInsert || this.isUpsert) {
                return new Date();
            } else {
                this.unset(); // Prevent user from supplying their own value
            }
        }
    }
});

Licenses.attachSchema(LicenseSchema);
