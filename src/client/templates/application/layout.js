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

Template.layout.rendered = function() {
    $('#search-overlay').on('shown.bs.modal', function () {
        $('#search-field').focus();
    });
    $('#app-search').hide();
    $('#dataset-search').hide();
};

Template.layout.events({
    "keyup #search-field": _.throttle(function (e) {
        let text = $(e.target).val().trim();
        $('#search-field').width(30 + text.length*18);
        //console.log(search(text));
        if(text.length>0) {
            $('#app-search').show();
            $('#dataset-search').show();
            $('.align-box').slideUp();
        } else {
            $('#app-search').hide();
            $('#dataset-search').hide();
            $('.align-box').slideDown();
        }
        Session.set('search', text);
    }, 200)
});
