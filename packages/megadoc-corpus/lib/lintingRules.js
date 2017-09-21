const { LOG_ERROR } = require('megadoc-linter')

exports.NoNamespaceConflicts = {
  name: 'no-namespace-conflicts',
  messageFn: ({ node }) => `Namespace with id "${node.id}" already exists.`,
  defaults: {
    level: LOG_ERROR
  }
}

exports.NoConflicts = {
  name: 'no-conflicts',
  messageFn: ({ path, previousLocation }) => (
    `Node "${path}" was seen before in "${previousLocation}".`
  ),
  defaults: {
    level: LOG_ERROR
  }
}