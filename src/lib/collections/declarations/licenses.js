/**
 * Created by xgfd on 22/01/2016.
 */

Licenses = new orion.collection('licenses', {
    singularName: 'license', // The name of one of these items
    pluralName: 'licenses', // The name of more than one of these items
    link: {
        // *
        //  * The text that you want to show in the sidebar.
        //  * The default value is the name of the collection, so
        //  * in this case it is not necessary.

        title: 'Licenses'
    },
    /**
     * Tabular settings for this collection
     */
    tabular: {
        // here we set which data columns we want to appear on the data table
        // in the CMS panel
        columns: [
            {
                data: "name",
                title: "Name"
            },
            {
                data: "url",
                title: "URL"
            },
            {
                data: "text",
                title: "Content"
            },
            orion.attributeColumn('createdAt', 'datePublished', 'Created'),
        ]
    }
});

defaultLicenses = new Set([
    "afl-3.0", "agpl-3.0", "apache-2.0", "artistic-2.0",
    "bsd-2-clause", "bsd-3-clause-clear", "bsd-3-clause", "cc0-1.0", "epl-1.0",
    "gpl-2.0", "gpl-3.0", "isc", "lgpl-2.1", "lgpl-3.0", "mit", "mpl-2.0",
    "ms-pl", "ms-rl", "no-license", "ofl-1.1", "osl-3.0", "unlicense", "wtfpl"
]);

Licenses.allow({
    insert: function (userId, entry, fieldNames) {
        return true;
    },
    update: function (userId, entry, fieldNames) {
        return ownsDocument(userId, entry);
    },
    remove: function (userId, entry) {
        return ownsDocument(userId, entry);
    }
});

// Meteor.call requires parameters to be of EJSON, passing a collection as it is
// causes a Maximum call stack size exceeded error
toEJSONSingularType(Licenses, Licenses.singularName);
