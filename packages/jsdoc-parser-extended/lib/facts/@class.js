module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@class',
    properties: [
      ['name'],
      ['text']
    ]
  },

  semantics: [
    ['document'],
    ['tags-document', 'class-constructor'],

    ['defines-property', {
      name: 'id',
      value: '$name'
    }],

    ['defines-property', {
      name: 'kind',
      value: 'class',
    }],

    ['defines-property', {
      name: 'type',
      value: 'function',
      implicit: true,
    }],
  ]
}