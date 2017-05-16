module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@description',

    properties: [
      ['text', { required: true }],
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'description',
      value: '$text'
    }]
  ]
}