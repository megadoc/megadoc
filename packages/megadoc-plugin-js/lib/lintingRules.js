const { LOG_ERROR, LOG_WARN } = require('megadoc-linter')

exports.NoUnknownTags = {
  name: 'js/no-unknown-tags',
  messageFn: tag => `"${tag.type}" is not a recognized tag`,
  defaults: {
    level: LOG_WARN
  }
}

exports.NoOrphans = {
  name: 'js/no-orphans',
  messageFn: doc => `"${doc.id}" could not be mapped to any module`,
  defaults: {
    level: LOG_ERROR
  }
}

exports.NoUnknownNodes = {
  name: 'js/no-unknown-nodes',
  messageFn: doc => (
    `"${doc.id}" syntax node type is unrecognized. This probably means megadoc ` +
    `does not know how to handle it yet.`
  ),
  defaults: {
    level: LOG_ERROR
  }
}