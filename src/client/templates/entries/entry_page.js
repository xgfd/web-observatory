Template.entryPage.helpers({
    appendHash(str) {
        return '#' + str;
    },
    distData() {
        this.dsId = Template.parentData().entry._id;
        return this;
    },
    queryResult() {
        return Session.get('queryResult');
    },
    requestFormTitle() {
        if (this.category === Groups) {
            return "Join the group"
        } else {
            return "Request access"
        }
    },
    showRequestForm(){
        let {entry, category} = this,
            userId = Meteor.userId();

        if (category === Groups) {
            return entry.aclContent && //everyone can join
                !_.contains(entry.contentWhiteList, userId);//and not a member already
        } else {
            if (category === Datasets || category === Apps) {
                return !accessesDocument(userId, entry);
            } else {
                return false;
            }
        }
    }
});

Template.entryPage.rendered = function () {
    $('ul.tabs').tabs();
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal-trigger').leanModal({
        complete: function () {
            Session.set('queryResult', null);
        }
    });

    //transform type=url to link
    $('[type=url]').after(function () {
        let url = this.value;
        if (url) {
            $(this).hide();
            return "<a href='" + url + "'>" + url + "</a>";
        }
    });
};

Template.entryPage.events({
    'click a.modal-action.modal-close': function (e) {
        console.log(e);
        Streamy.emit('amqp_end');
    }
});
