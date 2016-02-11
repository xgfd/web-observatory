/**
 * Created by eugenesiow on 08/02/2016.
 */

Template.searchEntryItem.helpers({
    blurb (text, limit) {
        let blurb = jQuery.truncate(text, {
            length: limit
        });
        return blurb
    }
});

Template.searchEntryItem.events({
    "click a": function() {
        $('#search-overlay').modal('hide');
    },
});