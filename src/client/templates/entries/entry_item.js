let schemaOrg = 'http://schema.org/';

Template.entryItem.helpers({
    //schema.org helpers
    itemtype() {
        let parentData = Template.parentData(1),
            category = parentData.category;

        switch (category) {
            case Datasets:
                return schemaOrg + 'Dataset';
                break;
            case Apps:
                return schemaOrg + 'Apps';
                break;
            case Groups:
                return schemaOrg + 'Groups';
                break;
        }
    },
    blurb (text, limit) {
        let blurb = jQuery.truncate(text, {
            length: limit
        });
        return blurb
    },
    offline () {
        if (Template.parentData().category.singularName === 'group') {
            return false;
        }

        if (this.distribution) {
            return this.distribution.some(function (dist) {
                return !dist.online;
            });
        }
        return !this.online;
    },
    ownEntry (entry = this) {
        return entry.publisher == Meteor.userId() || Roles.userHasRole(Meteor.userId(), "admin");
    },
    publisherObj() {
        return Meteor.users.findOne(this.publisher);
    },
    absUrl () {
        let parentData = Template.parentData(1),
            category = parentData.category;

        let a = document.createElement('a');
        a.href = `/${category.pluralName}/${this._id}`;
        return a.host + a.pathname;
    },
    upVotedClass() {
        let userId = Meteor.userId();
        if (userId && !_.include(this.downvoters, userId) && !_.include(this.upvoters, userId)) {
            return 'upvotable';
        } else {
            return 'disabled';
        }
    },
    downVotedClass() {
        let userId = Meteor.userId();
        if (userId && !_.include(this.downvoters, userId) && !_.include(this.upvoters, userId)) {
            return 'downvotable';
        } else {
            return 'disabled';
        }
    },
    showInNewTab() {
        //permitted to access
        if (accessesDocument(Meteor.userId(), this)) {
            // app, group
            if (this.url) {
                return this.url;
            }
            //dataset with only one html distribution
            if (this.distribution && this.distribution.length === 1 && this.distribution[0].fileFormat === 'HTML') {
                return this.distribution[0].url;
            }
        }
    }
});

Template.entryItem.events({
    'click .upvotable' (e) {
        e.preventDefault();
        let parentData = Template.parentData(1);
        Meteor.call('upvote', this._id, parentData.category);
    },
    'click .downvotable' (e) {
        e.preventDefault();
        let parentData = Template.parentData(1);
        Meteor.call('downvote', this._id, parentData.category);
    }
});

Template.distribution.helpers({
    offlineClass () {
        if (this.online) {
            return "teal";
        } else {
            return "grey";
        }
    }
});

Template.entryItem.rendered = function () {
    $('.tooltipped').tooltip({delay: 300});
};
