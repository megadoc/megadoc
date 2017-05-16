module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@name',
    properties: [
      ['name'],
      ['text'],
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'id',
      value: '$name'
    }],

    ['defines-property', {
      name: 'description',
      value: '$text'
    }],

    ['defines-property', {
      name: 'kind',
      value: 'namespace'
    }]
  ]
}