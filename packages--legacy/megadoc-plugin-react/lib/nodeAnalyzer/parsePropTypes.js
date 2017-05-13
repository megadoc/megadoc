var t = require('babel-types');

function parsePropTypes(node, filePath) {
  var propTypes = [];
  var propTypesNode = node.properties.filter(function(propNode) {
    return (
      t.isObjectProperty(propNode) &&
      t.isIdentifier(propNode.key) &&
      propNode.key.name === 'propTypes'
    );
  })[0];

  if (propTypesNode) {
    if (t.isObjectExpression(propTypesNode.value)) {
      propTypesNode.value.properties.forEach(function(propNode) {
        var typeInfo = extractPropInfo(propNode);

        if (!typeInfo.type) {
          console.warn('Unrecognized propType node of type "%s" (source: %s)',
            propNode.value ? propNode.value.type : propNode.node.type,
            filePath + ':' + propNode.loc.start.line
          );
        }

        typeInfo.name = propNode.key.name;

        propTypes.push(typeInfo);
      })
    }
  }

  return propTypes;
}

function extractPropInfo(node) {
  var value = node.value;

  if (t.isMemberExpression(node.value)) {
    //     propTypes: {
    //       name: React.PropTypes.string.isRequired
    //       ^^^^                  ^^^^^^ ^^^^^^^^^^
    //     }
    if (t.isMemberExpression(value.object) && t.isIdentifier(value.property) && value.property.name === 'isRequired') {
      return { type: value.object.property.name, isRequired: true };
    }

    //    propTypes: {
    //      name: React.PropTypes.string
    //      ^^^^                  ^^^^^^
    //    }
    else if (t.isIdentifier(value.object) && t.isIdentifier(value.property)) {
      if (value.property.name === 'isRequired') {
        return { type: value.object.name, isRequired: true };
      }
      else {
        return { type: node.value.property.name };
      }
    }
    //    propTypes: {
    //      id: oneOfType([ number, string ]).isRequired
    //          ^^^^^^^^^                     ^^^^^^^^^^
    //    }
    else if (t.isCallExpression(value.object) && t.isIdentifier(value.property)) {
      var typeInfo = parseCallExpression(value.object)

      if (value.property.name === 'isRequired') {
        typeInfo.isRequired = true;
      }

      return typeInfo;
    }
    else {
      return { type: node.value.property.name };
    }
  }
  // { name: React.PropTypes.oneOfType }
  else if (t.isMemberExpression(node)) {
    return { type: node.property.name }; // TODO: isRequired support?
  }
  //    propTypes: {
  //      name: string
  //      ^^^^^ ^^^^^^
  //    }
  else if (t.isIdentifier(node.value)) {
    return { type: node.value.name };
  }
  //    propTypes: {
  //      name: oneOf()
  //            ^^^^^
  //    }
  else if (t.isIdentifier(node)) {
    return { type: node.name };
  }
  //    propTypes: {
  //      age: oneOf([ 1, 2 ])
  //                   ^
  //    }
  else if (t.isLiteral(node)) {
    return { type: 'literal', value: node.value };
  }
  //    propTypes: {
  //      name: function() {}
  //      ^^^^
  //    }
  else if (t.isFunctionExpression(node.value) || t.isArrowFunctionExpression(node.value)) {
    // console.log('hello!', node.value)

    // this is some weird babel-exclusive thing where (i believe) an anonymous
    // function assigned to an ObjectProperty ends up having an implicit name
    // inferred from that property key identifier...
    //
    // in that case, we don't actually want to consider it as a custom propType
    if (t.isIdentifier(node.value.id) && node.value.id.name !== node.key.name) {
      return { type: node.value.id.name };
    }

    return { type: 'custom' };
  }
  //    propTypes: {
  //      name: function someNamedProp() {}
  //      ^^^^           ^^^^^^^^^^^^^
  //    }
  else if (t.isFunctionExpression(node.value) && t.isIdentifier(node.value.id)) {
    return { type: node.value.id.name };
  }
  //    propTypes: {
  //      count: oneOfType([ number, string ])
  //      // or
  //      count: shape({})
  //      // etc.
  //    }
  else if (t.isCallExpression(node.value)) {
    return parseCallExpression(node.value);
  }
  else if (t.isArrayExpression(node)) {
    return node.elements.map(extractPropInfo);
  }
  else if (t.isObjectExpression(node)) {
    return node.properties.map(function(propNode) {
      var info = extractPropInfo(propNode);
      info.name = propNode.key.name;
      return info;
    });
  }

  return {};
}

function parseCallExpression(expr) {
  var modifier = extractPropInfo(expr.callee);
  var elements = expr.arguments.map(extractPropInfo);

  if (modifier.type === 'shape') {
    return {
      type: modifier.type,
      properties: elements[0]
    };
  }
  else if (modifier.type === 'instanceOf') {
    return {
      type: modifier.type,
      target: elements[0]
    };
  }
  else if (modifier.type === 'oneOfType') {
    return {
      type: modifier.type,
      types: elements[0],
    };
  }
  else if (modifier.type === 'arrayOf') {
    return {
      type: modifier.type,
      types: elements,
    };
  }
  else if (modifier.type === 'oneOf') {
    return {
      type: modifier.type,
      values: elements[0]
    }
  }
  else {
    return {};
  }
}

module.exports = parsePropTypes;
