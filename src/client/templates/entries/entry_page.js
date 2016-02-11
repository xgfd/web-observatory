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

function urlToLink() {
    //transform type=url to link
    $('[type=url]').after(function () {
        let url = this.value;
        if (url) {
            $(this).hide();
            return "<a href='" + url + "'>" + url + "</a>";
        }
    });
}

function liceToLink() {
    //transform license to link
    let $lice = $('select[name=license]'),
        eltId = $lice.attr('id'),
        $wrapper = $lice.closest('.row'),
        lice = $wrapper.find('.select-dropdown').val().toLowerCase();

    let $row = $("<div class='col s12'></div>");
    if (defaultLicenses.has(lice)) {
        $row.append(`<a class="btn" href="http://choosealicense.com/licenses/${lice}" target="_blank">Show license</a>`);
    }

    let liceObj = Licenses.findOne({name: lice});
    if (liceObj) {
        if (liceObj.url) {
            $row.append(`<a class="btn" href="${liceObj.url}" target="_blank">Show license</a>`);
        } else {
            $row.append(`<a id="liceModalTrigger" class="btn modal-trigger" href="#liceModal">Show license</a>`);
            $row.append(`<div id="liceModal" class="modal">
                            <div class="modal-content">
                              <p>${liceObj.text}</p>
                            </div>
                            <div class="modal-footer">
                              <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Close</a>
                            </div>
                          </div> `);
        }
    } else {
        //should not reach here
    }

    $wrapper.append($row);
}

function entriToLink() {

}

Template.entryPage.rendered = function () {
    //$('ul.tabs').tabs();
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered

    urlToLink();
    //liceToLink();

    //$('.modal-trigger').leanModal();

    //$('#amqpModalTrigger').leanModal({
    //    complete: function () {
    //        Session.set('queryResult', null);
    //    }
    //});
};

Template.entryPage.events({
    'click a.modal-action.modal-close': function (e) {
        Streamy.emit('amqp_end');
    }
});
