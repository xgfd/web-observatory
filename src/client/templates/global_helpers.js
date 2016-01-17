/**
 * Created by xgfd on 29/12/2015.
 */

Template.registerHelper('canAccess', (entry) => {
    check(entry, Match.Any);
    //console.log(entry);
    return accessesDocument(Meteor.userId(), entry);
    //return Roles.userHasPermission(Meteor.userId(), 'collections.entries.access', entry);
});
