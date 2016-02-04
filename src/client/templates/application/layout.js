//Template.layout.onRendered(function() {
//  this.find('#main')._uihooks = {
//    insertElement: function(node, next) {
//      $(node)
//        .hide()
//        .insertBefore(next)
//        .fadeIn();
//    },
//    removeElement: function(node) {
//      $(node).fadeOut(function() {
//        $(this).remove();
//      });
//    }
//  }
//});

Meteor.startup(function() {
    $('body').attr('id',"page-top");
    $('body').attr('data-spy',"scroll");
    $('body').attr('data-target',".navbar-fixed-top");
});