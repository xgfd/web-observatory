Comments = new orion.collection('comments', {
    singularName: 'comment', // The name of one of these items
    pluralName: 'comments', // The name of more than one of these items
    link: {
        // *
        //  * The text that you want to show in the sidebar.
        //  * The default value is the name of the collection, so
        //  * in this case it is not necessary.

        title: 'Comments'
    },
    /**
     * Tabular settings for this collection
     */
    tabular: {
        // here we set which data columns we want to appear on the data table
        // in the CMS panel
        columns: [
            {
                data: "publisher",
                title: "Author",
                render: function (val, type, doc) {
                    let username = Meteor.users.findOne(val).username;
                    return username;
                }
            }, {
                data: "entryId",
                title: "Comment of",
                render: function (val, type, doc) {
                    let entryId = val;

                    //A comment can be of either a dataset or an app
                    let entryTitle = Datasets.findOne(entryId).name || Apps.findOne(entryId).name;
                    return entryTitle;
                }
            }, {
                data: "body",
                title: "Comment",
                tmpl: Meteor.isClient && Template.commentsIndexBlurbCell
            },
            orion.attributeColumn('createdAt', 'submitted', 'Submitted')
        ]
    },
});

//TODO add allow & deny rules

