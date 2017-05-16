module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@type',

    properties: [
      ['type', { required: true }],
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'type',
      value: '$type'
    }],
  ]
}