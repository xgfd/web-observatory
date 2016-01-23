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

    //transform license to link
    let $lice = $('select[name=license]'),
        eltId = $lice.attr('id'),
        $wrapper = $lice.closest('.select-wrapper'),
        lice = $wrapper.find('.select-dropdown').val().toLowerCase();


    $wrapper.after(function () {

        if (lice === 'unspecified') {
            return lice.toUpperCase();
        }

        if (defaultLicenses.has(lice)) {
            return `<input readonly id=${eltId}><a href="http://choosealicense.com/licenses/${lice}" target="_blank">${lice.toUpperCase()}</a></input>`
        }

        let liceObj = Licenses.findOne({name: lice});
        if (liceObj) {
            if (liceObj.url) {
                return `<input readonly id=${eltId}><a href="http://choosealicense.com/licenses/${lice}" target="_blank">${lice.toUpperCase()}</a></input>`
            } else {
                return `<p>${lice.toUpperCase()}</p>${liceObj.text}<p>`;
            }
        } else {
            return lice.toUpperCase();
        }
    });
    $wrapper.remove();
};

Template.entryPage.events({
    'click a.modal-action.modal-close': function (e) {
        console.log(e);
        Streamy.emit('amqp_end');
    }
});
