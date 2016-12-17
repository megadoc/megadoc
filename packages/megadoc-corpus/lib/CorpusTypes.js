var assert = require('assert');
var typeDefs = {};
var typeCheckers = {};
var builders = {};
var builtInTypes = {};
var assign = require('lodash').assign;
var uniq = require('lodash').uniq;
var camelizeCache = {};
var definitions = [];

/**
 * @module CorpusTypes
 */

/**
 * @lends CorpusTypes
 * @private
 *
 * Define a corpus node type. The type will not be usable until [.finalize]()
 * is invoked.
 *
 * @param  {String} typeName
 * @param  {Object} typeDef
 */
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
}

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

  TypeBuilder.prototype.merge = function(nextFields) {
    return new TypeBuilder(knownFields.reduce((map, key) => {
      map[key] = nextFields.hasOwnProperty(key) ? nextFields[key] : this[key];

      return map;
    }, {}));
  };

  TypeBuilder.prototype.consumeFields = function(fields) {
    var that = this;

    // reject unrecognized fields and validate recognized ones
    Object.keys(fields).forEach(function(fieldName) {
      var fieldValue = fields[fieldName];
      var typeError;

      assert(fieldName in typeDef.fields,
        "Field '" + fieldName + "' is unrecognized for a node of type '" + typeName + "'."
      );

      typeError = typeCheckers[typeName][fieldName](fieldValue);

      if (typeError) {
        assert(false, "TypeError: " + typeError + " (source: " + typeName + "[\"" + fieldName + "\"])");
      }

      if (fieldName !== 'parentNode') {
        if (Array.isArray(fieldValue)) {
          fieldValue.forEach(assignParentNode);
        }
        else {
          assignParentNode(fieldValue);
        }
      }

      that[fieldName] = fieldValue;
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
    else if (typeof type === 'function') {
      return type(x);
    }
    else {
      return checkPrimitiveType(type, x);
    }
  };
}

function checkPrimitiveType(type, x) {
  var expectedType = type.name;

  var valid = (
    !!x &&
    (
      (x.constructor && x.constructor === type) ||
      (x.constructor && x.constructor.name === expectedType) ||
      typeof x === type ||
      x instanceof type
    )
  );

  if (!valid) {
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
  var descendants = exports.getTypeDescendants(expectedType);

  if (!x || descendants.indexOf(x.constructor.name) === -1) {
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
        'Expected value at [' + index + '] to be of one of the types { ' +
        type.typeNames + ' }, not \'' + getTypeOf(y) + '\''
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
  var typeNames = valueTypes.map(getTypeName).join(' | ');

  return {
    type: 'array',
    types: valueTypes.map(createTypeChecker),
    typeNames: typeNames,
    toString: function() {
      return 'Array.<' + typeNames + '>';
    }
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

/**
 * @lends CorpusTypes
 *
 * "Seal" the type definitions, create the builders and type checkers. This has
 * to be done separately from the stage where [.def]() is called so that we can
 * resolve custom types in the definitions.
 */
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
    return String(x);
  }
}

function getTypeOf(x) {
  if (Array.isArray(x)) {
    return 'Array.<' + uniq(x.map(getTypeOf)).join(', ') + '>';
  }
  return (x && x.constructor) ? x.constructor.name : typeof x;
}

builtInTypes["string"] = BuiltInTypeChecker('String', function(x) {
  return typeof x === 'string';
});

builtInTypes["number"] = BuiltInTypeChecker('Number', function(x) {
  return typeof x === 'number';
});

builtInTypes["boolean"] = BuiltInTypeChecker('Boolean', function(x) {
  return typeof x === 'boolean';
});

builtInTypes["regExp"] = BuiltInTypeChecker('RegExp', function(x) {
  return x instanceof RegExp;
});

builtInTypes["null"] = BuiltInTypeChecker('null', function(x) {
  return x === null || x === undefined;
});

builtInTypes["array"] = BuiltInTypeChecker('Array', function(x) {
  return Array.isArray(x);
});

builtInTypes["arrayOfType"] = array;
builtInTypes["oneOfType"] = or;

builtInTypes["object"] = BuiltInTypeChecker('Object', function(x) {
  return typeof x === 'object' && x !== null;
});


function BuiltInTypeChecker(typeName, f) {
  return function(x) {
    if (!f(x)) {
      return "Expected a value of type '" + typeName + "', not '" + getTypeOf(x) + "'";
    }
  };
}

/**
 * @lends CorpusTypes
 *
 * @property {Object} builders
 *           The set of corpus type builder functions. The functions defined
 *           in this property are what you'd use for building nodes of certain
 *           types.
 */
exports.builders = builders;
exports.def = def;
exports.array = array;
exports.or = or;
exports.finalize = finalize;
exports.builtInTypes = builtInTypes;
exports.types = builtInTypes;

/**
 * @param  {String}  typeName
 * @return {Boolean}
 *         Whether a definition exists for such a type.
 */
exports.isTypeKnown = function(typeName) {
  return typeName in typeDefs;
};

/**
 * @param  {String} typeName
 * @return {Array.<String>}
 *         The type and any ancestor types it may have inherited from.
 */
exports.getTypeChain = function(typeName) {
  // TODO: optimize/cache

  var typeDef = typeDefs[typeName];
  var ancestors = [ typeName ];

  while (typeDef) {
    if (typeDef.base) {
      ancestors.unshift(typeDef.base);
    }

    typeDef = typeDefs[typeDef.base];
  };

  return ancestors;
};

/**
 * @param  {String} typeName
 * @return {Array.<String>}
 *         The type and any types that eventually inherit from it.
 */
exports.getTypeDescendants = function(typeName) {
  // TODO: optimize/cache
  return Object.keys(typeDefs).filter(function(thisTypeName) {
    return exports.getTypeChain(thisTypeName).indexOf(typeName) > -1;
  });
};