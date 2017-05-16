module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@private',

    properties: [
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'access',
      value: 'private'
    }]
  ]
}