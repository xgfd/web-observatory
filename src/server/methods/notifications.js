/**
 * Created by xgfd on 13/01/2016.
 */

createNotification = function (initiatorId, entryId, entryName, userId, category, message, actions = false) {
    check(initiatorId, String);
    check(entryId, String);
    check(entryName, String);
    check(userId, String);
    check(category, String);
    check(message, String);
    check(actions, Match.Any);

    if (initiatorId !== userId) {
        Notifications.update({
            userId,
            initiatorId,
            category,
            entryId,
            entryName,
            message,
            actions,
            read: false
        }, {
            $set: {
                userId,
                initiatorId,
                category,
                entryId,
                entryName,
                message,
                actions,
                read: false
            }
        }, {upsert: true});
    }
};

Meteor.methods({
    createNotification,
    createRequestNotification(username, organisation, initiatorId, entry, category, note) {
        check(username, String);
        check(organisation, String);
        check(initiatorId, String);
        check(entry, Object);
        check(category, String);

        var path = Router.routes[category + '.page'].path({_id: entry._id});

        var message = `<strong>${username}</strong>`
                + (organisation ? ' of ' + '<strong>' + organisation + '</strong>' : '')
                + ' requested access to '
                + `${category} <a class="blue-text" href="${path}">${entry.name}</a><br>`
                + (note ? `"${note}"` : ""),
            actions = ['Allow', 'Deny'];

        createNotification(initiatorId, entry._id, entry.name, entry.publisher, category, message, actions);
    }
});
