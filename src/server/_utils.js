/**
 * Created by xgfd on 25/12/2015.
 */

/*
 * For each @name:@collection pair in @sources, publish @collection under @name using @publisher
 * The callback of @publisher is constricted by @cbGen(@name, @collection)->function
 */
publish = function (sources, publisher, cbGen) {
    for (let name in sources) {
        if (sources.hasOwnProperty(name)) {
            publisher(name, cbGen(sources[name], name));
        }
    }
};

JSONStream = Meteor.npmRequire('JSONStream');
