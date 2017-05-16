module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@interface',
    properties: [
      ['name'],
      ['text']
    ]
  },

  semantics: [
    ['document'],
    ['defines-property', {
      name: 'id',
      value: '$name'
    }],
    ['defines-property', {
      name: 'description',
      value: '$text'
    }],

    ['tags-document', 'class'],
    ['tags-document', 'abstract']
  ]
}