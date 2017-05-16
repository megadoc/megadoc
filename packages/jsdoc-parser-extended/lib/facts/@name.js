module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@name',
    properties: [
      ['name', { required: true }],
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'id',
      value: '$name'
    }],
  ]
}