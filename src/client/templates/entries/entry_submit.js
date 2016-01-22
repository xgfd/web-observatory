Template.entrySubmit.onCreated(function () {
    Session.set('entrySubmitErrors', {});
});

Template.entrySubmit.helpers({
    errorMessage: function (field) {
        return Session.get('entrySubmitErrors')[field];
    },
    errorClass: function (field) {
        return !!Session.get('entrySubmitErrors')[field] ? 'has-error' : '';
    }
});

Template.entrySubmit.onRendered(function () {
    hideFileUpload();
});

Template.entrySubmit.events({
    'change .fileUpload input[type=file]': fileUpload,
    'change select[name*=\\.fileFormat]': formatChange
});

AutoForm.hooks({
    postSubmitForm: {
        before: {
            insert: function (doc) {
                if (doc && doc.distribution) {
                    doc.distribution.forEach(dist=> {
                        if (dist.file) {
                            dist.fileFormat = 'File'
                        }
                    });
                }

                return doc;// (synchronous)
                //return false; (synchronous, cancel)
                //this.result(doc); //(asynchronous)
                //this.result(false); (asynchronous, cancel)
            }
        },
        after: {
            insert: function (error, result) {
                if (!error) {
                    Router.go(this.collection.singularName + '.page', {_id: this.docId});
                } else {
                    console.log(error);
                }
            }
        }
    }
});