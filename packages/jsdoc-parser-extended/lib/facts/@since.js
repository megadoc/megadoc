module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@since',

    properties: [
      ['text', { required: true }],
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'sinceTag',
      value: '$text'
    }]
  ]
}