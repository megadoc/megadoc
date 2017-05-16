module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@alias',

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