module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@implements',
    properties: [
      ['type', { required: true }]
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'implementedInterface',
      value: '$type'
    }]
  ]
}