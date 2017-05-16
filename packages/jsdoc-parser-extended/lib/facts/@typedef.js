module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@typedef',
    properties: [
      ['name', { required: true }],
      ['type'],
      ['text']
    ]
  },

  semantics: [
    ['document'],

    ['defines-property', {
      name: 'kind',
      value: 'typedef',
    }],

    ['defines-property', {
      name: 'id',
      value: '$name'
    }],

    ['defines-property', {
      name: 'type',
      value: '$type'
    }]
  ]
}