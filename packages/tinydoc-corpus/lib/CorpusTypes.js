var assert = require('assert');
var typeDefs = {};
var typeCheckers = {};
var builders = {};
var assign = require('lodash').assign;
var uniq = require('lodash').uniq;
var camelizeCache = {};
var definitions = [];

function def(typeName, typeDef) {
  typeDefs[typeName] = typeDef;

  definitions.push(function() {
    if (typeDef.base) {
      assign(typeDef.fields, typeDefs[typeDef.base].fields);
    }

    typeCheckers[typeName] = Object.keys(typeDef.fields).reduce(function(map, field) {
      map[field] = createTypeChecker(typeDef.fields[field]);
      return map;
    }, {});

    builders[camelize(typeName)] = createTypeBuilder(typeName, typeDef);
  });
};

function createTypeBuilder(typeName, typeDef) {
  var TypeBuilder, constructor; // eslint-disable-line
  var knownFields = Object.keys(typeDef.fields);
  var requiredFields = knownFields.filter(function(field) {
    return !typeDef.fields[field].optional;
  });

  // a hack so that constructor.name displays the type name properly
  eval( // eslint-disable-line
    'TypeBuilder = function ' + typeName + '() {' +
    '  return constructor.apply(this, arguments);' +
    '};'
  );

  constructor = function(fields) {
    if (!(this instanceof TypeBuilder)) {
      return new TypeBuilder(fields || {});
    }

    // verify all required fields are present
    requiredFields.forEach(function(field) {
      if (field === 'parentNode') { return; }

      assert(field in fields,
        "Field '" + field + "' is missing for a node of type '" + typeName + "'."
      );
    });

    this.consumeFields(fields);
    this.type = typeName;

    return this;
  };

  TypeBuilder.__typeDef__ = typeDef;
  TypeBuilder.prototype.toJSON = function() {
    return knownFields.concat(['type']).reduce(function(map, field) {
      map[field] = this[field];

      return map;
    }.bind(this), {});
  };

  TypeBuilder.prototype.consumeFields = function(fields) {
    var that = this;

    // reject unrecognized fields and validate recognized ones
    Object.keys(fields).forEach(function(field) {
      var typeError;

      assert(field in typeDef.fields,
        "Field '" + field + "' is unrecognized for a node of type '" + typeName + "'."
      );

      typeError = typeCheckers[typeName][field](fields[field]);

      if (typeError) {
        assert(false, "TypeError: " + typeError + " (source: " + typeName + "[\"" + field + "\"])");
      }

      if (Array.isArray(fields[field])) {
        fields[field].forEach(assignParentNode);
      }
      else {
        assignParentNode(fields[field]);
      }

      that[field] = fields[field];
    });

    function assignParentNode(x) {
      if (x) { // guard against nil values
        var xCtor = x.constructor;

        if (xCtor.__typeDef__ && 'parentNode' in xCtor.__typeDef__.fields) {
          x.parentNode = that;
        }
      }
    }
  };

  return TypeBuilder;
}

function createTypeChecker(type) {
  return function(x) {
    if (type === null) {
      if (x !== null && x !== undefined) {
        return 'Expected value to be "null"';
      }
    }
    else if (isOrType(type)) {
      if (!checkUnionType(type, x)) {
        return (
          'Expected value to be of one of the types [ ' +
          type.typeNames + ' ], not \'' + getTypeOf(x) + '\''
        );
      }
    }
    else if (isArrayType(type)) {
      return checkArrayType(type, x);
    }
    else if (typeof type === 'string') {
      return checkCustomType(type, x);
    }
    else {
      return checkPrimitiveType(type, x);
    }
  };
}

function checkPrimitiveType(type, x) {
  var expectedType = type.name;

  if (!x || x.constructor !== type) {
    return "Expected a value of type '" + expectedType + "', not '" + getTypeOf(x) + "'."
  }
}

function checkUnionType(type, x) {
  return type.types.some(function(typeChecker) {
    if (!typeChecker(x)) {
      return true;
    }
  });
}

function checkCustomType(type, x) {
  var typeConstructor = builders[camelize(type)];
  var expectedType = typeConstructor.name;

  if (!x || x.constructor !== typeConstructor) {
    return "Expected a value of type '" + expectedType + "', not '" + (getTypeOf(x)) + "'."
  }
}

function checkArrayType(type, x) {
  var error;

  if (!Array.isArray(x)) {
    return (
      'Expected value to be an array of the types [ ' +
      type.typeNames + ' ], not \'' + getTypeOf(x) + '\''
    );
  }

  x.some(function(y, index) {
    if (!checkUnionType(type, y)) {
      error = (
        'Expected value at [' + index + '] to be of one of the types [ ' +
        type.typeNames + ' ], not \'' + getTypeOf(y) + '\''
      );

      return true;
    }
  });

  return error;
}

function camelize(str, lowerFirst) {
  if (camelizeCache[str]) {
    return camelizeCache[str];
  }

  camelizeCache[str] = (str || '').replace(/(?:^|[-_])(\w)/g, function(_, c, index) {
    if (index === 0 && lowerFirst !== false) {
      return c ? c.toLowerCase() : '';
    } else {
      return c ? c.toUpperCase() : '';
    }
  });

  return camelizeCache[str];
};

function array() {
  var valueTypes = [].slice.call(arguments);

  return {
    type: 'array',
    types: valueTypes.map(createTypeChecker),
    typeNames: 'Array.<' + valueTypes.map(getTypeName).join(' | ') + '>',
  };
}

function isArrayType(type) {
  return type && type.type === 'array';
}

function or() {
  var valueTypes = [].slice.call(arguments);

  return {
    type: 'or',
    types: valueTypes.map(createTypeChecker),
    typeNames: valueTypes.map(getTypeName).join(' | '),
    optional: valueTypes.some(function(x) { return x === null }),
  };
}

function isOrType(type) {
  return type && type.type === 'or';
}

function finalize() {
  definitions.forEach(function(fn) {
    fn();
  });

  definitions.splice(0);
}

function getTypeName(x) {
  if (typeof x === 'string') {
    return x;
  }
  else if (typeof x === 'function') {
    return x.name;
  }
  else if (x === null) {
    return 'null';
  }
  else if (isArrayType(x)) {
    return x.typeNames;
  }
  else {
    console.log('unknown type!', typeof x, x)
    return String(x);
  }
}

function getTypeOf(x) {
  if (Array.isArray(x)) {
    return 'Array.<' + uniq(x.map(getTypeOf)).join(', ') + '>';
  }
  return (x && x.constructor) ? x.constructor.name : typeof x;
}

exports.builders = builders;
exports.def = def;
exports.array = array;
exports.or = or;
exports.finalize = finalize;
