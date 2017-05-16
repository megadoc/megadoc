module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@access',

    properties: [
      ['name', {
        required: true,
        oneOf: [ 'public', 'private', 'protected' ]
      }]
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'access',
      value: '$name'
    }]
  ]
}