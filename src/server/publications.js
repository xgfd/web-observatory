/*collection publication*/
publish({
    datasets: Datasets,
    apps: Apps,
    groups: Groups,
    userNames: Meteor.users
}, Meteor.publish, function (collection) {
    return function (options = {}, selector = {}) {
        //check(options, {
        //    fields: Match.Optional(Object),
        //    skip: Match.Optional(Object),
        //    sort: Match.Optional(Object),
        //    limit: Match.Optional(Number)
        //});
        if (!selector) {
            selector = {};
        }

        if (!options) {
            options = {};
        }

        check(selector, Object);

        switch (collection) {
            case Meteor.users:
                options.fields = {username: 1};
                break;

            case Datasets:
                let userId = this.userId;
                extendOr(selector, viewsDocumentQuery(userId));
                options.fields = {
                    //'distribution.url': 0,
                    'distribution.file': 0,
                    'distribution.profile.username': 0,
                    'distribution.profile.pass': 0
                };
                break;

            case Apps:
                userId = this.userId;
                extendOr(selector, viewsDocumentQuery(userId));
                break;
        }

        return collection.find(selector, options);
    };
});

publish({singleDataset: Datasets, singleApp: Apps, singleGroup: Groups}, Meteor.publish, function (collection) {
    return function (id, options = {}) {
        check(id, String);

        let selector = {_id: id},
            userId = this.userId;

        extendOr(selector, viewsDocumentQuery(userId));
        options.fields = {
            //'distribution.url': 0,
            'distribution.file': 0,
            'distribution.profile.username': 0,
            'distribution.profile.pass': 0,
        };

        return collection.find(selector, options);
    }
});

Meteor.publish('comments', function (entryId) {
    check(entryId, String);
    return Comments.find({entryId: entryId});
});

Meteor.publish('notifications', function () {
    return Notifications.find({userId: this.userId, read: false});
});

Meteor.publish('images', function () {
    return Images.find();
});