module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@throws',
    aliases: [ '@exception', '@throw' ],
    properties: [
      ['type'],
      ['text'],
    ]
  },

  semantics: [
    ['appends-to-property-list', {
      name: 'thrownExceptions',
      value: ['composite-value', {
        type: '$type',
        description: '$text',
      }]
    }]
  ]
}