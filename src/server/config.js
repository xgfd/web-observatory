/**
 * Created by xgfd on 11/01/2016.
 */

Meteor.startup(function () {
    let settings = Meteor.settings;

    //create admin
    if (!settings.admin) {
        settings.admin = {name: 'admin', username: 'admin', email: 'admin@webobservatory.org', password: 'admin'};
    }

    if (!Accounts.findUserByUsername(settings.admin.username)) {
        let xgfdId = Accounts.createUser({
            profile: {
                name: settings.admin.name
            },
            username: settings.admin.username,
            email: settings.admin.email,
            password: settings.admin.password
        });

        Roles.removeUserFromRoles(xgfdId, ["individual"]);
        Roles.addUserToRoles(xgfdId, ["admin"]);
    }

    // 1. Set up stmp
    //   your_server would be something like 'smtp.gmail.com'
    //   and your_port would be a number like 25

    if (settings.smtp) {
        process.env.MAIL_URL = 'smtp://' +
                //encodeURIComponent(your_username) + ':' +
                //encodeURIComponent(your_password) + '@' +
            encodeURIComponent(settings.smtp);
    }

    // Add Facebook configuration entry

    if (settings.facebook) {
        ServiceConfiguration.configurations.update(
            {"service": "facebook"},
            {
                $set: {
                    "appId": settings.facebook.appId,
                    "secret": settings.facebook.secret
                }
            },
            {upsert: true}
        );
    }

    // Add GitHub configuration entry
    if (settings.github) {
        ServiceConfiguration.configurations.update(
            {"service": "github"},
            {
                $set: {
                    "clientId": settings.github.clientId,
                    "secret": settings.github.secret
                }
            },
            {upsert: true}
        );
    }
});
