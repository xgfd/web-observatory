AutoForm.hooks({
    postEditForm: {
        beginSubmit: function (doc) {
        },
        after: {
            update: function (error, result) {
                if (!error) {
                    Router.go(this.collection.singularName + '.page', {_id: this.docId});
                } else {
                    console.log(error);
                }
            }
        },
    }
});

Template.entryEdit.onRendered(function () {
    showChooseLicense();
});

Template.entryEdit.events({
    'change .fileUpload input[type=file]': fileUpload
});

Template.entryEdit.helpers({
    omitFields(){
        return omitFields;
    }
});
