/**
 * Created by xgfd on 13/01/2016.
 */

Meteor.methods({
    commentInsert: function (commentAttributes, category) {
        check(this.userId, String);
        check(category, Mongo.Collection);
        check(category.singularName, Match.OneOf('dataset', 'app'));
        check(commentAttributes, {
            entryId: String,
            body: String
        });

        entry = category.findOne(commentAttributes.entryId);

        if (!entry)
            throw new Meteor.Error('invalid-comment', 'You must comment on ' + category);

        comment = _.extend(commentAttributes, {
            publisher: this.userId,
            category: category.singularName,
            //author: user.username,
            submitted: new Date()
        });

        // update the post with the number of comments
        category.update(comment.entryId, {$inc: {commentsCount: 1}});

        // create the comment, save the id
        comment._id = Comments.insert(comment);

        // now create a notification, informing the user that there's been a comment
        createCommentNotification(comment, category);

        return comment._id;
    }
});

function createCommentNotification(comment, category) {
    check(comment, Object);
    check(category, Mongo.Collection);
    check(category.singularName, Match.OneOf('dataset', 'app'));

    let entryId = comment.entryId,
        entry = category.findOne(entryId),
        initiatorId = comment.publisher;

    let path = Router.routes[category.singularName + '.page'].path({_id: entryId});
    let message = '<a href="' + path + '"> <strong>' + Meteor.users.findOne(initiatorId).username + '</strong> commented on your post </a>';

    if (initiatorId !== entry.publisher) {
        createNotification(initiatorId, entryId, entry.name, entry.publisher, category.singularName, message);
    }
};
