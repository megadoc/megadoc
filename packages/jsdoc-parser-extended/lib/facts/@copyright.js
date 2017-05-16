module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@copyright',

    properties: [
      ['text', { required: true }],
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'copyrightText',
      value: '$text'
    }]
  ]
}