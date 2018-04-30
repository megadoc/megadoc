const parseTypes = require('./Docstring__parseTypeString');
const { TypeExpressions } = require('./lintingRules')

function TypeInfo(commentNode, { linter, nodeLocation }) {
  var description = commentNode.description;
  var name = (commentNode.name || '').trim();
  var typeInfo = {};

  var hasType = commentNode.type && commentNode.type.length > 0;

  // Example tags without a type but with a name:
  //
  //     /**
  //      * @example Do something.
  //      */
  //
  // Gives us:
  //
  //     {
  //       name: 'Do',
  //       description: 'something'
  //     }
  //
  // But we want:
  //
  //     {
  //       description: 'Do something.'
  //     }
  //
  if (commentNode.tag === 'example' && !hasType) {
    description = commentNode.source.replace(/^@example[ ]?/, '');

    if (commentNode.name.trim().length > 0) {
      var descriptionLines = description.split('\n');

      name = descriptionLines[0].trim();
      description = descriptionLines.slice(1).join('\n');
    }
  }

  if (name.length > 0) {
    typeInfo.name = name;
  }

  if (description && description.length > 0) {
    typeInfo.description = description;
  }

  if (hasType) {
    try {
      typeInfo.type = parseTypes(commentNode.type);
    }
    catch (e) {
      linter.logRuleEntry({
        rule: TypeExpressions,
        params: {
          typeString: commentNode.type,
          typeError: e
        },
        loc: linter.locationForNodeWithOffset(nodeLocation, commentNode.line)
      })

      typeInfo.type = { name: commentNode.type }
    }

    if (!typeInfo.type || !typeInfo.type.name) {
      delete typeInfo.type;
    }
  }

  if (commentNode.optional) {
    typeInfo.isOptional = true;

    if (commentNode.default) {
      typeInfo.defaultValue = commentNode.default;
    }
  }

  return typeInfo;
}

module.exports = TypeInfo;
