ReactiveTemplates.onCreated('collections.comments.index', function () {

    let sub = this.subscribe('datasets', {fields: {'name': 1, 'publisher': 1}, sort: {name: -1, _id: -1}, limit: 0});

    sub = this.subscribe('userNames', {fields: {'username': 1, '_id': 1}, sort: {username: -1, _id: -1}, limit: 0});

    if (sub.ready()) {
        debugger
        console.log('subscription ready!');
    }
});

ReactiveTemplates.onCreated('collections.datasets.index', function () {

    //let sub = this.subscribe('userNames', {fields: {'username': 1}, sort: {username: -1, _id: -1}, limit: 0});
    //
    //if (sub.ready()) {
    //    debugger
    //    console.log('subscription ready!');
    //}
});
