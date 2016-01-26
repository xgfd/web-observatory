// orion.dictionary.addDefinition('image', 'comment', 
//   orion.attribute('image', {
//       label: 'Comment Image',
//       optional: true
//   })
// );

orion.dictionary.addDefinition('title', 'mainPage', {
    type: String,
    label: 'Site Title',
    optional: false,
    min: 1,
    max: 40
});

orion.dictionary.addDefinition('description', 'mainPage', {
        type: String,
        label: 'Site Description',
        optional: true
    }
);

orion.dictionary.addDefinition('termsAndConditions', 'submitPostPage', {
        type: String,
        label: 'Terms and Conditions',
        optional: true
    }
);

//ldap
let ldapSchema = new SimpleSchema({
    domain: {type: String},
    serverDN: {type: String, label: 'Server DN'},
    serverUrl: {type: String, label: 'Server Url'},
    whiteListedFields: {type: String, label: 'Included fields'}
});

orion.dictionary.addDefinition('ldap', 'ldap', {type: [ldapSchema]});
