module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@classdesc',

    properties: [
      ['text', { required: true }],
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'description',
      value: '$text'
    }],
    ['tags-document', 'class']
  ]
}