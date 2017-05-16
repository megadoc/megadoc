module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@extends',
    properties: [
      ['name', { required: true }]
    ]
  },

  semantics: [
    ['inherits-document', {
      source: '$name'
    }]
  ]
}