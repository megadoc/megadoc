const { LOG_ERROR } = require('megadoc-linter')

exports.NoBrokenLinks = {
  name: 'html/no-broken-links',
  messageFn: ({ path }) => `Unable to resolve link to "${path}"`,
  defaults: {
    level: LOG_ERROR
  }
}