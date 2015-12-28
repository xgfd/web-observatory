Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',
    waitOn: function () {
        return [
            Meteor.subscribe('notifications'),
            Meteor.subscribe('groups'),
            Meteor.subscribe('userNames'),
        ]
    }
});

ListController = RouteController.extend({
    template: 'entryList',
    increment: 12,
    entriesLimit: function () {
        return parseInt(this.params.entriesLimit) || this.increment;
    },
    findOptions: function () {
        return {sort: this.sort, limit: this.entriesLimit()};
    },
    findSelector: function () {
        var query = this.params.query;
        _.keys(query).forEach(function (key) {
            switch (key) {
                case 'online':
                case 'aclMeta':
                case 'aclContent':
                    query[key] = query[key].toLowerCase() === 'true'
                    break;
                default:
                    query[key] = query[key];
            }
        });

        //this function runs twice due to reactivity
        //set findSelector to return the computed query straight away
        //in the second run
        this.findSelector = function () {
            return query;
        }
        return query;
    },
    category: null, //overrided in sub controllers
    search: function (text = "") {
        this.searchSource.search(text,
            {
                options: this.findOptions(),
                selector: this.findSelector(),
            });
    },
    entries: function () {
        return this.searchSource.getData({
            options: this.findOptions(),
            transform: function (matchText, regExp) {
                return matchText.replace(regExp, "<b>$&</b>")
            }
        });
    },
    // helper to generate route names of a given category;
    // a workaround since cannot dynamically concatenate variables in templates
    routes: function (cat) {
        check(cat, String);
        return ['latest', 'page', 'submit', 'edit'].reduce(function (routes, action) {
            routes[action] = cat + '.' + action;
            return routes;
        }, {});
    },
    data: function () {
        var self = this;
        return {
            category: self.category,
            entries: self.entries.bind(self),
            searchSource: self.searchSource,
            search: self.search.bind(self),
            showSearch: true,
            showAdd: true,
            ready: function () {
                return !self.searchSource.getStatus().loading;
            },
            routes: self.routes(self.category.singularName),
            nextPath: function () {
                if (self.entries().length === self.entriesLimit())
                    return self.nextPath();
            }
        };
    }
});

//entries
LatestController = ListController.extend({
    subscriptions: function () {
        this.searchSource = new SearchSource(this.category.singularName, ['name', 'description'], {
            keepHistory: 1000 * 60 * 5,
            localSearch: true
        });
        this.search();
    },
    sort: {datePublished: -1, _id: -1},
});

DatasetLatestController = LatestController.extend({
    category: Datasets,
    nextPath: function () {
        return Router.routes['dataset.latest'].path({entriesLimit: this.entriesLimit() + this.increment})
    }
});

AppLatestController = LatestController.extend({
    category: Apps,
    nextPath: function () {
        return Router.routes['app.latest'].path({entriesLimit: this.entriesLimit() + this.increment})
    }
});

//single entry
PageController = ListController.extend({
    template: 'entryPage',
    data: function () {
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
    subscriptions: function () {
        return [Meteor.subscribe('singleDataset', this.params._id),
            Meteor.subscribe('comments', this.params._id)];
    },
});

AppPageController = PageController.extend({
    category: Apps,
    subscriptions: function () {
        return [Meteor.subscribe('singleApp', this.params._id),
            Meteor.subscribe('comments', this.params._id)];
    },
});

HomeController = ListController.extend({
    template: 'home',
    increment: 4,
    sort: {votes: -1, datePublished: -1, _id: -1},
    subscriptions: function () {
        return [Meteor.subscribe('datasets', this.findOptions()), Meteor.subscribe('apps', this.findOptions())];
    },
    datasets: function () {
        return Datasets.find({}, this.findOptions());
    },
    apps: function () {
        return Apps.find({}, this.findOptions());
    },
    data: function () {
        var self = this;
        return {
            dataset: {
                category: Datasets,
                routes: self.routes('dataset'),
                entries: self.datasets(),
                ready: self.ready.bind(self)
            },
            app: {
                category: Apps,
                routes: self.routes('app'),
                entries: self.apps(),
                ready: self.ready.bind(self)
            },
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
    data: {col: 'Datasets'}
});

Router.route('/datasets/:_id', {name: 'dataset.page'});

Router.route('/datasets/:_id/edit', {
    name: 'dataset.edit',
    template: 'entryEdit',
    waitOn: function () {
        return Meteor.subscribe('singleDataset', this.params._id);
    },
    data: function () {
        return {category: Datasets, entry: Datasets.findOne(this.params._id)};
    }
});


/*
 * Apps routes
 */

Router.route('/new/apps/:entriesLimit?', {name: 'app.latest'});

Router.route('/apps/submit', {
    template: 'entrySubmit',
    name: 'app.submit',
    data: {col: 'Apps'}
});

Router.route('/apps/:_id', {name: 'app.page'});

Router.route('/apps/:_id/edit', {
    name: 'app.edit',
    template: 'entryEdit',
    waitOn: function () {
        return Meteor.subscribe('singleApp', this.params._id);
    },
    data: function () {
        return {category: Apps, entry: Apps.findOne(this.params._id)};
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
var requireLogin = function () {
    if (!Meteor.user()) {
        if (Meteor.loggingIn()) {
            this.render(this.loadingTemplate);
        } else {
            this.render('accessDenied');
        }
    } else {
        this.next();
    }
}

Router.onBeforeAction('dataNotFound', {only: 'dataset.page'});
Router.onBeforeAction(requireLogin, {only: 'dataset.submit'});