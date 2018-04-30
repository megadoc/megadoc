const { LOG_ERROR, LOG_WARN } = require('megadoc-linter')

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

exports.TypeExpressions = {
  name: 'js/type-expressions',
  messageFn: ({ typeString/*, typeError*/ }) => (
    `"${typeString}" is not a valid type expression`
  ),
  defaults: {
    level: LOG_ERROR
  }
}

exports.CommentAnnotations = {
  name: 'js/comment-annotations',
  messageFn: ({ /*commentString, */ parseError }) => {
    if (parseError) {
      return `comment could not be parsed...\n\n${parseError.message}`
    }
    else {
      return `invalid comment annotation (expecting /** ... */)`
    }
  },
  defaults: {
    level: LOG_ERROR
  }
}