module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: [ '@memberof', '@memberOf' ],

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