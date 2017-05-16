module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@param',
    aliases: [ '@argument', '@arg' ],
    properties: [
      ['type', { required: true }],
      ['defaultValue'],
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
      name: 'params',
      value: param => ({
        name: param.name,
        type: param.type,
        description: param.text,
        defaultValue: param.defaultValue,
      })
    }]
  ]
}