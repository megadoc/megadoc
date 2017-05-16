module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@lends',

    properties: [
      ['name', { required: true }]
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'receiver',
      value: '$name'
    }]
  ]
}