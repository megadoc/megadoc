module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@member',

    properties: [
      ['name'],
      ['type'],
    ]
  },

  semantics: [
    ['tags-document', 'member'],
    ['defines-property', {
      name: 'id',
      value: '$name'
    }],

    ['defines-property', {
      name: 'type',
      value: '$type'
    }],
  ]
}