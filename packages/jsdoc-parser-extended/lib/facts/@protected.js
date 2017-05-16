module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@protected',

    properties: [
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'access',
      value: 'protected'
    }]
  ]
}