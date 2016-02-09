Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',
    subscriptions () { //using waitOn will cause entry_list to reload every time load-more is clicked
        return [
            Meteor.subscribe('notifications'),
            Meteor.subscribe('groups'),
            Meteor.subscribe('userNames'),
            Meteor.subscribe('licenses')
        ]
    }
});

ListController = RouteController.extend({
    template: 'entryList',
    increment: 12,
    //query modifier generation helper
    entriesLimit () {
        return parseInt(this.params.entriesLimit) || this.increment;
    },
    //query modifier generator
    findOptions () {
        return {sort: this.sort, limit: this.entriesLimit()};
    },
    //query generator
    findSelector () {
        let textFilter = search(Session.get('search'));
        let query = {}, _query = this.params.query;

        _.keys(_query).forEach(function (key) {
            console.log(key);
            switch (key) {
                case 'online':
                case 'aclMeta':
                case 'aclContent':
                    query[key] = _query[key].toLowerCase() === 'true'
                    break;
                default:
                    query[key] = _query[key];
            }
        });

        _.extend(query, textFilter);

        ////this function runs twice due to reactivity (subscriptions)
        ////set findSelector to return the computed query straight away
        ////in the second run
        //this.findSelector = function () {
        //    return query;
        //}
        return query;
    },
    //collection of entries (e.g. Apps, Datasets)
    category: null, //overrided in sub controllers
    //displayed entries
    entries () {
        return this.category.find({}, {sort: this.findOptions.sort});
    },
    // helper to generate route names of a given category;
    // a workaround since cannot dynamically concatenate variables in templates
    routes (cat = this.category.singularName) {
        return ['latest', 'page', 'submit', 'edit'].reduce(function (routes, action) {
            routes[action] = cat + '.' + action;
            return routes;
        }, {});
    },
    data () {
        let self = this;
        return {
            category: self.category,
            entries: self.entries(),
            //show search bar in top nav on entry list page
            showSearch: true,
            //show Add button if logged in
            showAdd: true,
            ready () {
                return self.ready();
            },
            routes: self.routes(),
            //generate path to load next page of entries
            nextPath () {
                if (self.category.find().count() === self.entriesLimit()) {
                    return self.nextPath();
                }
            }
        };
    }
});

RegExp.prototype.toJSONValue = function () {
    let flags = '';
    if (this.global) {
        flags += 'g';
    }
    if (this.ignoreCase) {
        flags += 'i';
    }
    if (this.multiline) {
        flags += 'm';
    }
    return [this.source, flags];
};

RegExp.prototype.typeName = function () {
    return "regex";
};

EJSON.addType("regex", function (str) {
    return new RegExp(...str);
});

function search(searchText) {
    let selector;
    if (searchText) {
        let regExp = buildRegExp(searchText);
        selector = {
            $or: [
                {name: regExp},
                {description: regExp},
                {'distribution.fileFormat': regExp}
            ]
        };
    } else {
        selector = {};
    }

    return selector;
}

function searchName(searchText) {
    let selector;
    if (searchText) {
        let regExp = buildRegExp(searchText);
        selector = {
            $or: [
                {name: regExp}
            ]
        };
    } else {
        selector = {};
    }

    return selector;
}

//any position
function buildRegExp(searchText) {
    let parts = searchText.trim().split(/[ \-\:]+/);
    return new RegExp("(" + parts.join('|') + ")", "ig");
}

//type ahead
//function buildRegExp(searchText) {
//    let words = searchText.trim().split(/[ \-\:]+/);
//    let exps = _.map(words, function (word) {
//        return "(?=.*" + word + ")";
//    });
//    let fullExp = exps.join('') + ".+";
//    return new RegExp(fullExp, "i");
//}
/***************************
 * entry list
 **************************/
LatestController = ListController.extend({
    subscriptions () {
        return Meteor.subscribe(this.category.pluralName, this.findOptions(), this.findSelector());
    },
    sort: {datePublished: -1, votes: -1, downvotes: 1, _id: -1},
    nextPath () {
        return Router.routes[this.category.singularName + '.latest'].path({entriesLimit: this.entriesLimit() + this.increment});
    }
});

DatasetLatestController = LatestController.extend({
    category: Datasets
});

AppLatestController = LatestController.extend({
    category: Apps
});

GroupLatestController = LatestController.extend({
    category: Groups,
    nextPath () {
        return Router.routes['group.latest'].path({entriesLimit: this.entriesLimit() + this.increment})
    }
});
/***************************
 * entry page
 **************************/
PageController = ListController.extend({
    template: 'entryPage',
    data () {
        return {
            comments: Comments.find({entryId: this.params._id}),
            category: this.category,
            entry: this.category.findOne(this.params._id),
            routes: this.routes(this.category.singularName),
        };
    }
});

DatasetPageController = PageController.extend({
    category: Datasets,
    subscriptions () {
        return [Meteor.subscribe('singleDataset', this.params._id),
            Meteor.subscribe('comments', this.params._id)];
    },
});

AppPageController = PageController.extend({
    category: Apps,
    subscriptions () {
        return [Meteor.subscribe('singleApp', this.params._id),
            Meteor.subscribe('comments', this.params._id)];
    },
});

GroupPageController = PageController.extend({
    category: Groups,
    subscriptions () {
        return [Meteor.subscribe('singleGroup', this.params._id),
            Meteor.subscribe('comments', this.params._id)];
    },
});

HomeController = ListController.extend({
    template: 'home',
    increment: 8,
    sort: {votes: -1, downvotes: 1, datePublished: -1, _id: -1},
    subscriptions () {
        return [Meteor.subscribe('datasets', this.findOptions(), this.findSearchSelector()), Meteor.subscribe('apps', this.findOptions(), this.findSearchSelector())];
    },
    findSearchSelector() {
        let textFilter = searchName(Session.get('search'));
        return textFilter;
    },
    //recent () {
    //    let ds = Datasets.find({}, {sort: {datePublished: -1}, limit: 8}).fetch();
    //    let ap = Apps.find({}, {sort: {datePublished: -1}, limit: 8}).fetch();
    //    let cb =ds.concat(ap);
    //    return _.first(_.sortBy(cb, function(cb) {return cb.datePublished;}).reverse(),8);
    //},
    datasets (options) {
        if(!options)
            options = this.findOptions();
        return Datasets.find({}, options);
    },
    apps (options) {
        if(!options)
            options = this.findOptions();
        return Apps.find({}, options);
    },
    nextPath () {
        //console.log("runnext");
        return Router.routes['datasets.latest'].path({entriesLimit: this.entriesLimit() + this.increment});
    },
    data () {
        let self = this;
        return {
            recentDataset: {
                category: Datasets,
                routes: self.routes('dataset'),
                entries: self.datasets({sort: {datePublished: -1}, limit: 8}),
                ready: self.ready.bind(self),
            },
            recentApp: {
                category: Apps,
                routes: self.routes('app'),
                entries: self.apps({sort: {datePublished: -1}, limit: 8}),
                ready: self.ready.bind(self),
            },
            dataset: {
                category: Datasets,
                routes: self.routes('dataset'),
                entries: self.datasets({sort: {votes: -1},  limit: 8}),
                ready: self.ready.bind(self),
                nextPath () {
                    if (Datasets.find().count() === self.entriesLimit()) {
                        
                    }
                }
            },
            app: {
                category: Apps,
                routes: self.routes('app'),
                entries: self.apps({sort: {votes: -1},  limit: 8}),
                ready: self.ready.bind(self),
                nextPath () {
                    if (Apps.find().count() === self.entriesLimit()) {

                    }
                }
            },
            _isHome:true
        };
    }
});

/****************************************************************
 * Routes
 * Route naming schema {{category}}.{{action}}
 *****************************************************************/

/*
 * Home
 */

Router.route('/', {name: 'home'});

/*
 * Datasets routes
 */

Router.route('/new/datasets/:entriesLimit?', {name: 'dataset.latest'});

Router.route('/datasets/submit', {
    template: 'entrySubmit',
    name: 'dataset.submit',
    data() {
        return {category: Datasets, col: 'Datasets'};
    }
});

Router.route('/datasets/:_id', {name: 'dataset.page'});

Router.route('/datasets/:_id/edit', {
    name: 'dataset.edit',
    template: 'entryEdit',
    waitOn () {
        return Meteor.subscribe('singleDataset', this.params._id);
    },
    data () {
        return {
            category: Datasets,
            entry: Datasets.findOne()
        };
    }
});

/*
 * Apps routes
 */

Router.route('/new/apps/:entriesLimit?', {name: 'app.latest'});

Router.route('/apps/submit', {
    template: 'entrySubmit',
    name: 'app.submit',
    data() {
        return {category: Apps, col: 'Apps'};
    }
});

Router.route('/apps/:_id', {name: 'app.page'});

Router.route('/apps/:_id/edit', {
    name: 'app.edit',
    template: 'entryEdit',
    waitOn () {
        return Meteor.subscribe('singleApp', this.params._id);
    },
    data () {
        return {category: Apps, entry: Apps.findOne()};
    }
});

/*
 * Groups
 */
Router.route('/new/groups/:entriesLimit?', {name: 'group.latest'});

Router.route('/groups/submit', {
    template: 'entrySubmit',
    name: 'group.submit',
    data() {
        return {category: Groups, col: 'Groups'};
    }
});

Router.route('/groups/:_id', {name: 'group.page'});

Router.route('/groups/:_id/edit', {
    name: 'group.edit',
    template: 'entryEdit',
    waitOn () {
        return Meteor.subscribe('singleGroup', this.params._id);
    },
    data () {
        return {category: Groups, entry: Groups.findOne()};
    }
});
/*
 * Accounts
 */

AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('enrollAccount');
AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('verifyEmail');

/*
 * Helpers
 */
function requireLogin() {
    if (!Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied', {data: 'Please sign in.'});
        }
    } else {
        this.next();
    }
}

//Router.onBeforeAction('dataNotFound', {only: 'dataset.page'});
Router.onBeforeAction(requireLogin, {only: ['dataset.submit', 'dataset.edit', 'app.submit', 'app.edit']});

Router.onBeforeAction(function () {
    let {entry, category} = this.data();
    if (Meteor.userId() && entry //should not be necessary
        && ownsDocument(Meteor.userId(), entry)) {
        this.next();
    } else {
        this.render('accessDenied', {data: "You cannot edit others' " + category.singularName});
    }
}, {only: ['dataset.edit', 'app.edit']});

Router.onBeforeAction(function () {//using named function causes an error
    let {entry, category} = this.data();
    if (viewsDocument(Meteor.userId(), entry)) {
        this.next();
    } else {
        this.render('accessDenied', {data: "You cannot view this " + category.singularName});
    }

}, {only: ['dataset.page', 'app.page']});
