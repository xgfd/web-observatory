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
    // AutoForm.hooks({
    //   entrySubmitForm: hooksObject
    // });

});

Template.entrySubmit.events({
    'change .fileUpload input[type=file]': fileUpload,
    'change select[name*=\\.fileFormat]': formatChange
});

AutoForm.hooks({
    postSubmitForm: {
        before: {
            insert: function (doc) {
                console.log(doc);
                // Potentially alter the doc

                // Then return it or pass it to this.result()
                //return doc; (synchronous)
                //return false; (synchronous, cancel)
                //this.result(doc); (asynchronous)
                //this.result(false); (asynchronous, cancel)
            }
        },
        beginSubmit: function (doc) {
            console.log(arguments);
            console.log('update');
            console.log(this.updateDoc);
        }
    }
});