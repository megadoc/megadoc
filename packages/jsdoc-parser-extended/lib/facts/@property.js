module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@property',
    aliases: [ '@prop' ],
    properties: [
      ['type', { required: true }],
      ['defaultValue'],
      ['name'],
      ['text'],
    ]
  },

  semantics: [
    ['document'],

    ['tags-document', 'member'],

    ['defines-property', {
      name: 'id',
      value: '$name',
    }],

    ['defines-property', {
      name: 'description',
      value: '$text',
    }],

    ['defines-property', {
      name: 'type',
      value: '$type',
    }],

    ['defines-property', {
      name: 'defaultValue',
      value: '$defaultValue',
    }],
  ]
}