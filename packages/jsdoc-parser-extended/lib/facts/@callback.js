module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@callback',
    properties: [
      ['name', { required: true }],
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
      name: 'type',
      value: 'function'
    }],

    ['defines-property', {
      name: 'kind',
      value: 'callback'
    }],
  ]
}