module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@fires',
    properties: [
      ['name', {
        required: true,
      }]
    ]
  },

  semantics: [
    ['appends-to-property-list', {
      name: 'triggeredEvents',
      value: '$name'
    }]
  ]
}