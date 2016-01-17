Template.commentItem.helpers({
    submittedText: function () {
        return this.submitted.toString();
    },
    publisher() {
        return Meteor.users.findOne(this.publisher);
    }
});