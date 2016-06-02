/**
 * Created by eugene on 11/02/2016.
 */

var options = {
    keepHistory: 1000 * 60 * 5,
    localSearch: true
};
var fields = ['name'];

AppSearch = new SearchSource('apps', fields, options);
DatasetSearch = new SearchSource('datasets', fields, options);
RemoteAppSearch = new SearchSource('remoteApps', fields, options);
RemoteDatasetSearch = new SearchSource('remoteDatasets', fields, options);

Template.search.rendered = function() {
    $('#app-search').hide();
    $('#dataset-search').hide();
    $('#remote-app-search').hide();
    $('#remote-dataset-search').hide();

    $('#search-overlay').on('shown.bs.modal', function () {
        $('#search-field').focus();
    });
};

Template.search.events({
    "keyup #search-field": _.throttle(function (e) {
        let text = $(e.target).val().trim();
        $('#search-field').width(30 + text.length*18);
        //console.log(search(text));
        if(text.length>0) {
            $('#app-search').show();
            $('#dataset-search').show();
            $('#remote-app-search').show();
            $('#remote-dataset-search').show();
            $('.align-box').slideUp();
        } else {
            $('#app-search').hide();
            $('#dataset-search').hide();
            $('#remote-app-search').hide();
            $('#remote-dataset-search').hide();
            $('.align-box').slideDown();
        }
        AppSearch.search(text);
        DatasetSearch.search(text);
        RemoteAppSearch.search(text);
        RemoteDatasetSearch.search(text);
        //Session.set('search', text);
    }, 200)
});

Template.search.helpers({
    searchDatasets: function() {
        return transformResults(DatasetSearch,'dataset');
    },
    searchApps: function() {
        return transformResults(AppSearch,'app');
    },
    searchRemoteDatasets: function() {
        return transformResults(RemoteDatasetSearch,'remoteDataset');
    },
    searchRemoteApps: function() {
        return transformResults(RemoteAppSearch,'remoteApp');
    },
    //isLoading: function() {
    //    return DatasetSearch.getStatus().loading;
    //}
});

function transformResults(searchSource, catName) {
    return {
        entries: searchSource.getData({
            transform: function(matchText, regExp) {
                return matchText.replace(regExp, "<mark>$&</mark>")
            }
        }),
        routes: catName+'.page',
        //category: Datasets,
        //routes: Router.routes['dataset.page'],
        //ready: searchSource.getStatus().loading,
    };
}


//Template.search.onCreated(function () {
//
//    // 1. Initialization
//
//    var instance = this;
//
//    // initialize the reactive variables
//    instance.loaded = new ReactiveVar(0);
//    instance.limit = new ReactiveVar(5);
//
//    // 2. Autorun
//
//    // will re-run when the "limit" reactive variables changes
//    instance.autorun(function () {
//
//        // get the limit
//        var limit = instance.limit.get();
//
//        console.log("Asking for "+limit+" posts…")
//
//        //subscribe to the posts publication
//        //var subscription = instance.subscribe('searchDatasets', {limit});
//        var subscription = instance.subscribe('searchDatasets', {}, findSearchSelector);
//
//        // if subscription is ready, set limit to newLimit
//        if (subscription.ready()) {
//            console.log("> Received "+limit+" posts. \n\n")
//            console.log(Template.instance().datasets().count());
//            instance.loaded.set(limit);
//        } else {
//            console.log("> Subscription is not ready yet. \n\n");
//        }
//    });
//
//    // 3. Cursor
//
//    instance.datasets = function() {
//        return Datasets.find({}, {limit: 1});
//        //return Datasets.find({}, {limit: instance.loaded.get()});
//    }
//
//});
//
//Template.search.helpers({
//    // the posts cursor
//    searchDatasets: function () {
//        return Template.instance().datasets();
//    },
//     //are there more posts to show?
//    hasMorePosts: function () {
//        return Template.instance().datasets().count() >= Template.instance().limit.get();
//    }
//});
//
//function findSearchSelector() {
//    let textFilter = searchName(Session.get('search'));
//    return textFilter;
//}
//
//function searchName(searchText) {
//    let selector;
//    if (searchText) {
//        let regExp = buildRegExp(searchText);
//        selector = {
//            $or: [
//                {name: regExp}
//            ]
//        };
//    } else {
//        selector = {};
//    }
//
//    return selector;
//}
//
////any position
//function buildRegExp(searchText) {
//    let parts = searchText.trim().split(/[ \-\:]+/);
//    return new RegExp("(" + parts.join('|') + ")", "ig");
//}