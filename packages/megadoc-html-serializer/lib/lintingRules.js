const { LOG_ERROR } = require('megadoc-linter')

exports.NoBrokenLinks = {
  name: 'html/no-broken-links',
  messageFn: ({ path }) => `"${path}" not found`,
  defaults: {
    level: LOG_ERROR
  }
}