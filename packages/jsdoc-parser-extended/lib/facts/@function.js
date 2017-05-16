module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@function',
    properties: [
      ['name']
    ]
  },

  semantics: [
    ['tags-document', 'function'],
    ['defines-property', {
      name: 'id',
      value: '$name'
    }]
  ]
}