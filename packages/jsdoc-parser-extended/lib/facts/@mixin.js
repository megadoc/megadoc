module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@mixin',
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
      name: 'kind',
      value: 'mixin',
    }],

    ['defines-property', {
      name: 'type',
      value: 'object',
      implicit: true
    }],
  ]
}