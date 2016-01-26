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

    process.env.MAIL_URL = 'smtp://' +
            //encodeURIComponent(your_username) + ':' +
            //encodeURIComponent(your_password) + '@' +
        encodeURIComponent(settings.smtp);

    // 2. Format the email
    //...

    // 3.  Send email when account is created
    //...
    // Add Facebook configuration entry

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

    // Overwrite this function to produce settings based on the incoming request
    LDAP.generateSettings = function (request) {
        let username = request.username,
            domain = username.split('@')[1];

        let ldaps = orion.dictionary.get('ldap.ldap'),
            ldapConfig;

        if (ldaps) {
            ldapConfig = ldaps.filter(v=>v.domain === domain)[0];
            ldapConfig.whiteListedFields = ldapConfig.whiteListedFields.split(/,\s*/);
            ldapConfig.autopublishFields = ldapConfig.autopublishFields ? ldapConfig.autopublishFields.split(/,\s*/) : ldapConfig.whiteListedFields;
            delete ldapConfig.domain;
        }

        return ldapConfig;
    };

    LDAP.bindValue = function (username, isEmailAddress, serverDn) {
        return ((isEmailAddress) ? username.split('@')[0] : username) + '@' + serverDn;
    };

    LDAP.filter = function (isEmailAddress, usernameOrEmail) {
        return '(&(cn=' + ((isEmailAddress) ? usernameOrEmail.split('@')[0] : usernameOrEmail) + ')(objectClass=user))';
    };

    LDAP.logging = false;

    Accounts.onCreateUser(function (options, user) {
        let profile = options.profile;
        if (profile) {
            if (profile.displayName) {
                profile.name = profile.displayName;
            }
        }
        user.profile = profile;
        return user;
    });
});
