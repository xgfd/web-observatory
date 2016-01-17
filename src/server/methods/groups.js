/**
 * Created by xgfd on 25/12/2015.
 */

Meteor.methods({
    addToGroup: function (userId, groupId) {
        check(userId, String);
        check(groupId, String);
        return Groups.update(groupId, {$addToSet: {contentWhiteList: userId}});
    },
    removeFromGroup: function (userId, groupId) {
        check(userId, String);
        check(groupId, String);
        Groups.update(groupId, {$pull: {contentWhiteList: userId}});
    }
});

