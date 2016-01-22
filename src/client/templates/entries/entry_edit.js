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

Template.entryEdit.events({
    'change .fileUpload input[type=file]': fileUpload
});
