/**
 * Created by xgfd on 19/12/2015.
 */

let App = {
    url: {
        type: String,
        label: "URL",
        regEx: SimpleSchema.RegEx.Url,
        autoform: {
            type: 'url',
            placeholder: "Provide the URL of your web app or upload the app source below"
        }
    },
    file: orion.attribute('file', {
        label: 'Upload app source as a zip file. Only support apps written in client-side JS and HTML',
        optional: true
    }),
    github: {
        type: String,
        optional: true,
        label: "Github",
        regEx: SimpleSchema.RegEx.Url
    }
};

//_.extend(App, CreativeWork);

//important, generate whitelist before constructing simpleschema
appWhitelist = _.filter(_.keys(App), function (property) {
    return !App[property].noneditable;
});

_.extend(appWhitelist, Whitelist);

appBlacklist = _.filter(_.keys(App), function (property) {
    return App[property].noneditable;
});

_.extend(appBlacklist, BlackList);

Apps.attachSchema(new SimpleSchema([Thing, App, CreativeWork]));
