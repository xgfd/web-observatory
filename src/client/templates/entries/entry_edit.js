AutoForm.hooks({
    postEditForm: {
        beginSubmit: function (doc) {
            //console.log('update');
            //console.log(this.updateDoc);
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
//Template.entryEdit.onCreated(function() {
//  Session.set('postEditErrors', {});
//});

//Template.entryEdit.helpers({
//  errorMessage: function(field) {
//    return Session.get('postEditErrors')[field];
//  },
//  errorClass: function (field) {
//    return !!Session.get('postEditErrors')[field] ? 'has-error' : '';
//  }
//});

//Template.entryEdit.events({
//  'submit form': function(e) {
//    e.preventDefault();
//
//    let currentPostId = this._id;
//
//    let postProperties = {
//      url: $(e.target).find('[name=url]').val(),
//      title: $(e.target).find('[name=title]').val()
//    }
//
//    let errors = validatePost(postProperties);
//    if (errors.title || errors.url)
//      return Session.set('postEditErrors', errors);
//
//    Datasets.update(currentPostId, {$set: postProperties}, function(error) {
//      if (error) {
//        // display the error to the user
//        throwError(error.reason);
//      } else {
//        Router.go('datasetPage', {_id: currentPostId});
//      }
//    });
//  },
//
//  'click .delete': function(e) {
//    e.preventDefault();
//
//    if (confirm("Delete this post?")) {
//      let currentPostId = this._id;
//      Datasets.remove(currentPostId);
//      Router.go('home');
//    }
//  }
//});
