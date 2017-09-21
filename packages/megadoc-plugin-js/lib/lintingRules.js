const { LOG_ERROR, LOG_WARN } = require('megadoc-linter')

exports.NoUnknownTags = {
  name: 'js/no-unknown-tags',
  messageFn: tag => `Unknown tag "${tag.type}"`,
  defaults: {
    level: LOG_WARN
  }
}

exports.NoOrphans = {
  name: 'js/no-orphans',
  messageFn: doc => `Unable to map "${doc.id}" to any module, it will be discarded.`,
  defaults: {
    level: LOG_ERROR
  }
}

exports.NoUnknownNodes = {
  name: 'js/no-unknown-nodes',
  messageFn: doc => (
    `Document "${doc.id}" is unrecognized. This probably means megadoc ` +
    `does not know how to handle it yet.`
  ),
  defaults: {
    level: LOG_ERROR
  }
}