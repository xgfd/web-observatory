/**
 * Created by xgfd on 17/12/2015.
 */

Datasets = new orion.collection('datasets', {
    singularName: 'dataset', // The name of one of these items
    pluralName: 'datasets', // The name of more than one of these items
    link: {
        // *
        //  * The text that you want to show in the sidebar.
        //  * The default value is the name of the collection, so
        //  * in this case it is not necessary.

        title: 'Datasets'
    },

    /**
     * Tabular settings for this collection
     */
    tabular: {
        // here we set which data columns we want to appear on the data table
        // in the CMS panel
        columns: [
            {
                data: "_id",
                title: "ID"
            },
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
            orion.attributeColumn('createdAt', 'datePublished', 'Published'),
        ]
    }
});

// Meteor.call requires parameters to be of EJSON, passing a collection as it is
// causes a Maximum call stack size exceeded error
toEJSONSingularType(Datasets, Datasets.singularName);

//Datasets.allow({
//    update: function (userId, entry, fieldNames) {
//        return ownsDocument(userId, entry);// && _.difference(fieldNames, datasetWhitelist).length === 0;
//    },
//    remove: function (userId, entry) {
//        return ownsDocument(userId, entry);
//    },
//});

//Datasets.deny({
//    update: function (userId, entry, fieldNames) {
//        return _.difference(fieldNames, datasetWhitelist).length !== 0;
//    }
//});

//Datasets.deny({
//    update: function (userId, entry, fieldNames, modifier) {
//        let errors = validateDataset(modifier.$set);
//        return errors.name || errors.distribution;
//    }
//});
