/**
 * Created by eugene on 11/02/2016.
 */

SearchSource.defineSource('apps', function(searchText, options) {
    var options = {limit: 10};

    if(searchText) {
        var regExp = buildRegExp(searchText);
        var selector = {$or: [
            {name: regExp},
        ]};

        return Apps.find(selector, options).fetch();
    } else {
        return Apps.find({}, options).fetch();
    }
});

SearchSource.defineSource('datasets', function(searchText, options) {
    var options = {limit: 10};

    if(searchText) {
        var regExp = buildRegExp(searchText);
        var selector = {$or: [
            {name: regExp},
        ]};

        return Datasets.find(selector, options).fetch();
    } else {
        return Datasets.find({}, options).fetch();
    }
});

function buildRegExp(searchText) {
    // this is a dumb implementation
    var parts = searchText.trim().split(/[ \-\:]+/);
    return new RegExp("(" + parts.join('|') + ")", "ig");
}