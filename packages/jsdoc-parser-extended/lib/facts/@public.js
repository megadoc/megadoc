module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@public',

    properties: [
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'access',
      value: 'public'
    }]
  ]
}