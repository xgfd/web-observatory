if (Meteor.settings.public.environment === 'dev' && !Meteor.settings.public.migrate) {
    /* testing cases
     *               ds1 (all)     ds2 (none)     ds3 (group)
     * admin           own             y            own
     * individual      y               own          n
     * member          y               n            y
     * group           y               n            y
     * */

    function addAdmin(name) {

        let xgfdId = Accounts.createUser({
            profile: {
                name: name
            },
            username: name,
            email: name + "@example.com",
            password: "123456",
        });

        Roles.removeUserFromRoles(xgfdId, ["individual"]);
        Roles.addUserToRoles(xgfdId, ["admin"]);

        return xgfdId;
    }

    function addIndividual(name) {
        return Accounts.createUser({
            profile: {
                name: name
            },
            username: name,
            email: name + "@example.com",
            password: "123456",
        });
    }

    function addGroup(name) {
        let xgfdId = Accounts.createUser({
            profile: {
                name: name,
                isgroup: true,
                description: "Vestibulum scelerisque auctor massa. In lectus arcu, eleifend quis faucibus malesuada, vulputate in lectus. Curabitur ut venenatis ligula, sit amet lacinia velit. Ut euismod libero sed odio efficitur tincidunt. Vestibulum a lacinia erat. Nulla pretium ante id fringilla pharetra. Aliquam varius, purus sed euismod ullamcorper, eros elit maximus magna, eu dignissim turpis leo in arcu. Nullam magna leo, blandit eu sollicitudin et, efficitur eget nibh. Etiam tempus mi eleifend commodo molestie.",
                url: "https://www.google.co.uk"
            },
            username: name,
            email: name + "@example.com",
            password: "123456",
        });

        Roles.removeUserFromRoles(xgfdId, ["individual"]);
        Roles.addUserToRoles(xgfdId, ["group"]);

        return xgfdId;
    }

    let xgfdId, individualId, groupId, memberId;
    if (Meteor.users.find().count() === 0) {
        xgfdId = addAdmin('xgfd');
        individualId = addIndividual('individual');
        groupId = addGroup('group');
        memberId = addIndividual('member');
        let tmp = Meteor.call('addToGroup', memberId, Groups.findOne({publisher: groupId})._id);
    }
// Fixture data
    let telescopeId;
    if (Datasets.find().count() === 0) {
        let now = new Date().getTime();

        telescopeId = Datasets.insert({
            name: 'Introducing Telescope',
            publisher: xgfdId,
            distribution: [{
                url: 'mongodb://localhost:3001/meteor',
                fileFormat: "MongoDB",
                online: true
            }, {
                url: 'amqp://wsi-h1.soton.ac.uk?exchange=logs',
                fileFormat: "AMQP",
                online: true
            }],
            license: "MIT",
            description: "Vestibulum scelerisque auctor massa. In lectus arcu, eleifend quis faucibus malesuada, vulputate in lectus. Curabitur ut venenatis ligula, sit amet lacinia velit. Ut euismod libero sed odio efficitur tincidunt. Vestibulum a lacinia erat. Nulla pretium ante id fringilla pharetra. Aliquam varius, purus sed euismod ullamcorper, eros elit maximus magna, eu dignissim turpis leo in arcu. Nullam magna leo, blandit eu sollicitudin et, efficitur eget nibh. Etiam tempus mi eleifend commodo molestie.",
            commentsCount: 2,
            aclContent: false,
            online: true,
            upvoters: [], votes: 0
        });

        Comments.insert({
            entryId: telescopeId,
            publisher: individualId,
            submitted: new Date(now - 5 * 3600 * 1000),
            body: 'Interesting project Sacha, can I get involved?'
        });

        Comments.insert({
            entryId: telescopeId,
            publisher: xgfdId,
            submitted: new Date(now - 3 * 3600 * 1000),
            body: "<p><span style=\"font-family: 'Comic Sans MS';\"><span style=\"font-size: 18px; background-color: rgb(255, 0, 0);\">You</span><span style=\"font-size: 18px;\"> </span><span style=\"font-size: 18px; background-color: rgb(255, 156, 0);\">sure</span><span style=\"font-size: 18px;\"> </span><span style=\"font-size: 18px; background-color: rgb(255, 255, 0);\">can</span><span style=\"font-size: 18px;\"> </span><span style=\"font-size: 18px; background-color: rgb(0, 255, 0);\">Tom</span><span style=\"font-size: 18px; background-color: rgb(0, 0, 255);\">!!!</span></span></p>"
        });

        Datasets.insert({
            name: 'The Meteor Book',
            publisher: individualId,
            distribution: [{
                url: 'http://themeteorbook.com',
                fileFormat: "MySQL",
                online: false
            }, {
                url: 'http://dbpedia.org/sparql',
                fileFormat: "SPARQL",
                online: true
            }],
            license: "MIT",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi pharetra augue eget hendrerit bibendum. Vivamus quis laoreet magna. Quisque eu mi sit amet lorem vestibulum rhoncus. Donec lacus est, sodales convallis urna nec, condimentum accumsan ligula. Nullam maximus a sem ac laoreet. In hac habitasse platea dictumst. Pellentesque porttitor ex orci, sed suscipit ante pretium eget. Nam vestibulum metus a libero ultricies molestie sed vel est. Maecenas porta tempus purus, sed pharetra nibh sodales vitae. Nullam in erat tristique, posuere enim laoreet, suscipit erat. Sed quis efficitur enim. 2",
            commentsCount: 0,
            online: false,
            aclMeta: false,
            upvoters: [], votes: 0
        });

        Datasets.insert({
            name: 'Group visible dataset',
            publisher: xgfdId,
            distribution: [{
                url: 'http://sachagreif.com/introducing-telescope/',
                fileFormat: "HTML",
                online: true
            }],
            license: "MIT",
            description: "Vestibulum scelerisque auctor massa. In lectus arcu, eleifend quis faucibus malesuada, vulputate in lectus. Curabitur ut venenatis ligula, sit amet lacinia velit. Ut euismod libero sed odio efficitur tincidunt. Vestibulum a lacinia erat. Nulla pretium ante id fringilla pharetra. Aliquam varius, purus sed euismod ullamcorper, eros elit maximus magna, eu dignissim turpis leo in arcu. Nullam magna leo, blandit eu sollicitudin et, efficitur eget nibh. Etiam tempus mi eleifend commodo molestie.",
            commentsCount: 0,
            aclMeta: false,
            aclContent: false,
            metaWhiteList: [groupId],
            contentWhiteList: [groupId],
            online: true,
            upvoters: [], votes: 0
        });

        for (let i = 0; i < 50; i++) {
            Apps.insert({
                name: 'Test app #' + i,
                url: 'http://sachagreif.com/introducing-telescope/#' + i,
                publisher: groupId,
                license: "MIT",
                aclContent: !!(i % 2),
                description: "Etiam porttitor purus et mollis malesuada. Nulla tempor orci id ex tincidunt consectetur. Praesent et dignissim lectus, in posuere ante. Curabitur nunc dolor, interdum a ornare eget, laoreet eu metus. Ut tempor lacinia eros nec finibus. Maecenas quis felis non mi euismod consectetur quis at leo. Nullam porta tempus ullamcorper. Phasellus et nibh feugiat, iaculis massa eget, blandit quam. Aliquam dolor justo, feugiat et sem ut, fermentum elementum arcu. Aliquam quis tincidunt tortor. Suspendisse potenti. Duis congue sapien ac purus iaculis pharetra. Donec hendrerit lacus leo, non ultricies purus accumsan nec. Nulla vel suscipit quam. Interdum et malesuada fames ac ante ipsum primis in faucibus.",
                commentsCount: 0,
                upvoters: [], votes: 0
            });
        }
    }
}
