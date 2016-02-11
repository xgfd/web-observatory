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

    $(window).scroll(collapseNavbar);
    $(document).ready(collapseNavbar);

    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        if ($(this).attr('class') != 'dropdown-toggle active' && $(this).attr('class') != 'dropdown-toggle') {
            $('.navbar-toggle:visible').click();
        }
    });
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

Template.registerHelper("log", function(something) {
    console.log(something);
});

// jQuery to collapse the navbar on scroll
function collapseNavbar() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
}