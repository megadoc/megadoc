module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@mixes',

    properties: [
      ['name', { required: true }]
    ]
  },

  semantics: [
    ['appends-to-property-list', {
      name: 'mixinTargets',
      value: '$name'
    }]
  ]
}