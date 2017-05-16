module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@listens',
    properties: [
      ['name', { required: true }]
    ]
  },

  semantics: [
    ['appends-to-property-list', {
      name: 'subscribedEvents',
      value: '$name'
    }]
  ]
}