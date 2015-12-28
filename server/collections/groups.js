/**
 * Created by xgfd on 25/12/2015.
 */
// When there is a change to group name, publisher name gets updated
var query = Groups.find();
var handle = query.observeChanges({
    changed: function(groupId, changedField){
        if(changedField.name){
            var groupAccountId = Groups.findOne(groupId).publisher;
            Meteor.users.update({_id: groupAccountId}, {$set: {name: changedField.name}});
        };
    }
});