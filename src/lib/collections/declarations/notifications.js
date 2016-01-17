Notifications = new Mongo.Collection('notifications');

Notifications.allow({
    update: function (userId, doc, fieldNames) {
        return doc.userId === userId &&
            fieldNames.length === 1 && fieldNames[0] === 'read';
    }
});

