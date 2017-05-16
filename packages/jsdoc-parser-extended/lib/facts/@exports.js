module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@exports',

    properties: [
      ['name'],
    ]
  },

  semantics: [
    ['tags-document', 'export']
  ]
}