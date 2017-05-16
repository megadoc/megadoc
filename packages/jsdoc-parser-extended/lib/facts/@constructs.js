module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@constructs',

    properties: [
      ['name', { required: true }],
      ['text'],
    ]
  },

  semantics: [
    ['tags-document', 'class-constructor'],

    ['defines-property', {
      name: 'type',
      value: 'function'
    }],

    ['tags-remote-document', {
      id: '$name',
      tag: 'class',
    }],
  ]
}