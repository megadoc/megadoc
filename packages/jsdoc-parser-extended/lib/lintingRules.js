const { LOG_WARN } = require('megadoc-linter')

exports.NoUnidentified = {
  name: 'js/no-unidentified',
  messageFn: () => 'document could not be identified',
  defaults: {
    level: LOG_WARN
  }
}

exports.PropertyNodes = {
  name: 'js/property-nodes',
  messageFn: ({ key = '?', value = '?' }) => `could not parse property pair [${key}]:[${value}]`,
  defaults: {
    level: LOG_WARN
  }
}