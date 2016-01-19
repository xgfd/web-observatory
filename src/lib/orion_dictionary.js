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