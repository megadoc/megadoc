module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@example',

    properties: [
      ['text', { required: true }],
    ]
  },

  semantics: [
    ['appends-to-property-list', {
      name: 'examples',
      value: '$text'
    }]
  ]
}