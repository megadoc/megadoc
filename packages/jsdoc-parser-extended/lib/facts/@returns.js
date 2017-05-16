module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@returns',
    aliases: [ '@return' ],
    properties: [
      ['type', { required: true }],
      ['name'],
      ['text'],
    ]
  },

  semantics: [
    ['defines-property', {
      name: 'type',
      value: 'function',
    }],

    ['appends-to-property-list', {
      name: 'returnValues',
      value: ['composite-value', {
        name: '$name',
        type: '$type',
        description: '$text',
      }]
    }]
  ]
}