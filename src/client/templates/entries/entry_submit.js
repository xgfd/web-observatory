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

    // AutoForm.hooks({
    //   entrySubmitForm: hooksObject
    // });

});

Template.entrySubmit.events({
    'change .fileUpload input[type=file]': fileUpload
});
