// http://usejsdoc.org/tags-event.html
module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@event',
    properties: [
      ['name', {
        required: true,
        format: '(:identifier)?[#~]([\w_-]+)',
        captureGroups: [ 'emitterName', 'eventName' ],
      }],

      ['text'],
    ]
  },

  semantics: [
    ['document'],

    ['tags-document', 'event'],

    ['defines-property', {
      name: 'id',
      value: '$eventName'
    }],

    ['defines-property', {
      name: 'receiver',
      value: '$emitterName'
    }],

    ['defines-property', {
      name: 'description',
      value: '$text'
    }]
  ]
}