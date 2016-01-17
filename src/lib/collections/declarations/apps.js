/**
 * Created by xgfd on 19/12/2015.
 */
Apps = new orion.collection('apps', {
    singularName: 'app', // The name of one of these items
    pluralName: 'apps', // The name of more than one of these items
    link: {
        // *
        //  * The text that you want to show in the sidebar.
        //  * The default value is the name of the collection, so
        //  * in this case it is not necessary.

        title: 'Apps'
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
                data: "publisher",
                render: function (val, type, doc) {
                    let publisherId = val;
                    let publisherName = Meteor.users.findOne(publisherId).username;
                    return publisherName;
                },
                title: "Publisher"
            },
            {
                data: "github",
                title: "Github"
            },
            orion.attributeColumn('createdAt', 'datePublished', 'Published'),
        ]
    }
});

// Meteor.call requires parameters to be of EJSON, passing a collection as it is
// causes a Maximum call stack size exceeded error
toEJSONSingularType(Apps, Apps.singularName);

Apps.allow({
    update: function (userId, entry, fieldNames) {
        return ownsDocument(userId, entry) && _.difference(fieldNames, appWhitelist).length === 0;
    },
    remove: function (userId, entry) {
        return ownsDocument(userId, entry);
    },
});
