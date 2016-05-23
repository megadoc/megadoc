var parseTypes = require('./Docstring__parseTypeString');

function TypeInfo(commentNode) {
  var description = commentNode.description;
  var name = (commentNode.name || '').trim();
  var typeInfo = {};

  if (name.length > 0) {
    typeInfo.name = name;
  }

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
    if (commentNode.name.trim().length > 0) {
      console.warn("Invalid @example tag: this tag does not support a name.");
    }
    // description = commentNode.source.split('\n').slice(1).join('\n')
      // .replace(/^\n+/, '\n')
      // .replace(/\n+$/, '\n')
    ;
    // description = (
    //   commentNode.name +
    //   (commentNode.name.match(/\s$/) ? '' : ' ') +
    //   commentNode.description
    // );

    delete typeInfo.name;
  }

  if (description && description.length > 0) {
    typeInfo.description = description;
  }

  if (hasType) {
    typeInfo.type = parseTypes(commentNode.type);

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
