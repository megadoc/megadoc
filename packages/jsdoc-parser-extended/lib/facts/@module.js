module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@module',
    properties: [
      ['name'],
      ['text']
    ]
  },

  semantics: [
    ['document'],

    ['tags-document', 'export'],
    ['tags-document', 'module'],

    ['defines-property', {
      name: 'id',
      value: '$name'
    }],

    ['defines-property', {
      name: 'kind',
      value: 'module',
    }],
  ]
}