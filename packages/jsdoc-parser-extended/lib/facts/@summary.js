module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@summary',

    properties: [
      ['text', { required: true }],
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'summary',
      value: '$text'
    }]
  ]
}