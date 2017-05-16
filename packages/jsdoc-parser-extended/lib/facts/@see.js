module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@see',
    properties: [
      ['text'],
    ]
  },

  semantics: [
    ['appends-to-property-list', {
      name: 'relatedDocuments',
      value: '$text'
    }]
  ]
}