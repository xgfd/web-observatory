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

orion.dictionary.addDefinition('description', 'mainPage', orion.attribute('froala', {
    label: 'Site Description',
    optional: true
  })
);

orion.dictionary.addDefinition('termsAndConditions', 'submitPostPage', orion.attribute('froala', {
    label: 'Terms and Conditions',
    optional: true
  })
);