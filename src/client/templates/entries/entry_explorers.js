/**
 * Created by xgfd on 01/01/2016.
 */

//register new message of type 'acceptTerms'
SimpleSchema.messages({acceptTerms: 'You must accept the terms and conditions of this item'});

Template.requestFrom.rendered = function () {
    $('.collapsible').collapsible({
        accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
};

let request = new SimpleSchema({
    name: {type: String, label: 'Name', autoform: {readonly: true}},
    username: {
        type: String,
        label: 'Username',
        autoform: {readonly: true}
    },
    email: {
        type: String,
        autoform: {readonly: true}
    },
    organisation: {type: String, label: 'Organisation', optional: true},
    message: {type: String, label: 'Leave a message', optional: true},
    acceptTerms: {
        type: Boolean,
        optional: true,
        label: 'Accept the license of this item',
        custom: function () {
            if (!this.value) {
                return "acceptTerms";
            }
        }
    }
});

Template.requestFrom.helpers({
    requestSchema(){
        return request;
    },
    showLicense(){
        let lice = this.entry.license.toLowerCase();

        if (lice === 'unspecified') {
            return lice.toUpperCase();
        }

        if (defaultLicenses.has(lice)) {
            return `<a href="http://choosealicense.com/licenses/${lice}" target="_blank">${lice.toUpperCase()}</a>`
        }

        let liceObj = Licenses.findOne({name: lice});
        if (liceObj) {
            if (liceObj.url) {
                return `<a href="${liceObj.url}" target="_blank">${lice.toUpperCase()}</a>`;
            } else {
                return `<p>${lice.toUpperCase()}</p>${liceObj.text}<p>`;
            }
        } else {
            return lice.toUpperCase();
        }
    }
});

Template.requestFrom.events({
    'submit form': function (e, template) {
        e.preventDefault();

        let user = Meteor.user(),
            $target = $(e.target);

        let initiatorId = user._id,
            name = user.profile.name || $target.find('[name=name]').val(),
            username = user.username,
            email = user.email || $target.find('[name=email]').val(),
            organisation = $target.find('[name=organisation]').val(),
            message = $target.find('[name=message]').val(),
            acceptTerms = $target.find('[name=acceptTerms]').prop('checked');

        if (initiatorId && acceptTerms) {
            Meteor.call('createRequestNotification', username, organisation, initiatorId, template.data.entry, template.data.category.singularName, message);
            Materialize.toast('Request sent!', 4000) // 4000 is the duration of the toast
        }
    }
});

function syntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'orange-text text-lighten-2';//number
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'red-text text-lighten-2';//key
            } else {
                cls = 'teal-text text-lighten-2';//string
            }
        } else if (/true|false/.test(match)) {
            cls = 'blue-text text-lighted-2';//boolean
        } else if (/null/.test(match)) {
            cls = 'pink-text text-lighten-2';//null
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

/*query event handling*/
function queryHandlerFactory(argGen, method, transform = (error, result)=> {
    result = error || result;
    result = syntaxHighlight(result);
    Session.set('queryResult', result);
}) {
    return function (e, template) {
        Session.set('queryResult', null);

        let args = argGen(e, template);

        Meteor.apply(method, args, transform);
    }
}

/*
 MongoDB functions
 */

let mongoDep;
Template.MongoDB.helpers({
        getMongoDBCollectionNames() {
            Meteor.call('mongodbConnect', this._id);
            let collectionNames = ReactiveMethod.call('mongodbCollectionNames', this._id);
            //change mongoDep after this function return
            Meteor.defer(function () {
                mongoDep.changed(); //feels like coding in Java
            });
            return collectionNames;
        }
    }
);

Template.MongoDB.onCreated(function () {
    mongoDep = new Tracker.Dependency();
});

Template.MongoDB.onRendered(function () {
    //only run at the first time it's rendered, by when collection names are not ready yet
    //use autorun and Tracker.Dependency to sync with getCollectionNames
    //ugly solution
    this.autorun(function () {
        mongoDep.depend();
        $('#collection').material_select();
    });
});

Template.MongoDB.events({
    'click a.btn.modal-trigger': queryHandlerFactory((e, template)=> {
        let distId = template.data._id,
            $target = $(`#${distId}`),
            collection = $target.find('[name=collection]')[0].value;

        let options = {};

        selector = JSON.parse($target.find('[name=selector]')[0].value);

        options.limit = parseInt($target.find('[name=limit]')[0].value) || 100;

        if (skip = $target.find('[name=skip]')[0].value) {
            options.skip = parseInt(skip);
        }

        if (sort = $target.find('[name=sort]')[0].value) {
            options.sort = JSON.parse(sort);
        }

        if (project = $target.find('[name=project]')[0].value) {
            options.project = JSON.parse(project);
        }

        return [distId, collection, selector, options];
    }, 'mongodbQuery')
});

/*
 * MySQL functions
 * */
Template.MySQL.events({
    'click a.btn.modal-trigger': queryHandlerFactory((e, template)=> {
        let distId = template.data._id,
            $target = $(`#${distId}`),
            query = $target.find('[name=query]')[0].value;
        return [distId, query];
    }, 'mysqlQuery')
});

/*
 * SPARQL functions
 * */
Template.SPARQL.events({
    'click a.btn.modal-trigger': queryHandlerFactory((e, template)=> {
        let distId = template.data._id,
            $target = $(`#${distId}`),
            query = $target.find('[name=query]')[0].value;
        return [distId, query];
    }, 'sparqlQuery')
});

/*
 * AMQP functions
 * */
// Override Meteor._debug to filter for custom msgs
Meteor._debug = (function (super_meteor_debug) {
    return function (error, info) {
        if (!(info && _.has(info, 'msg')))
            super_meteor_debug(error, info);
    }
})(Meteor._debug);

let amqpDep;
Template.AMQP.helpers({
        getAMQPExchanges() {
            let exchanges = ReactiveMethod.call('amqpCollectionNames', this._id);
            //change mongoDep after this function return
            Meteor.defer(function () {
                amqpDep.changed(); //feels like coding in Java
            });
            return exchanges;
        }
    }
);

Template.AMQP.onCreated(function () {
    amqpDep = new Tracker.Dependency();
});

Template.AMQP.onRendered(function () {
    //only run at the first time it's rendered, by when collection names are not ready yet
    //use autorun and Tracker.Dependency to sync with getCollectionNames
    //ugly solution
    this.autorun(function () {
        amqpDep.depend();
        $('#exchange').material_select();
    });
});

Template.AMQP.events({
    'click a.btn.modal-trigger': queryHandlerFactory((e, template)=> {
        let distId = template.data._id,
            $target = $(`#${distId}`),
            query = $target.find('[name=exchange]')[0].value;
        return [distId, query, Streamy.id()];
    }, 'amqpQuery', (error, queue)=> {
        if (error) {
            Session.set('queryResult', error);
        } else {
            let msgs = [];
            Streamy.on(queue, function (data) {
                data = syntaxHighlight(data.content);
                let length = msgs.unshift(data);
                if (length % 60 === 0) {
                    let msg = msgs.join('\n') + '\n' + Session.get('queryResult');
                    Session.set('queryResult', msg);
                }
            });
        }
    })
});
