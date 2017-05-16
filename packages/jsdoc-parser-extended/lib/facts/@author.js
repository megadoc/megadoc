module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@author',

    properties: [
      ['text', { required: true }],
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'authorDetails',
      value: '$text'
    }]
  ]
}