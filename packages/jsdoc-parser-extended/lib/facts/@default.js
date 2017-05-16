// http://usejsdoc.org/tags-default.html
module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@default',

    properties: [
      ['text', { required: false }]
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'defaultValue',
      value: '$text',
      credibility: 'meh'
    }]
  ]
}