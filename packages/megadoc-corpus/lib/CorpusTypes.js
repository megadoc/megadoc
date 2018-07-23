const R = require('ramda');
const typeDefs = {};
const builders = {};
const camelizeCache = {};
const createEmptyObject = () => ({})

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
function def(typeName, typeDef, typeFactory = createEmptyObject) {
  typeDefs[typeName] = typeDef;
  builders[camelize(typeName)] = createTypeBuilder(typeName, typeFactory);
}

// const omitInternalFields = R.without([
//   'indexFields',
//   'summaryFields',
// ]);

// const addRuntimeFields = R.concat([
//   'indices',
//   'path',
//   'type',
//   'uid',
// ]);

function assignNodeType(type) {
  return function(node) {
    return Object.assign(node, { type });
  }
}

function ensureHasMetaContainer(node) {
  return Object.assign(node, { meta: node.meta || {} });
}

function ensureHasSymbol(node) {
  switch (node.type) {
    case 'Namespace':
    case 'Document':
      return Object.assign(node, {
        symbol: node.hasOwnProperty('symbol') ? node.symbol : '/'
      });

    default:
      return node;
  }
}

function createTypeBuilder(type, factory) {
  return props => R.pipe(
    assignNodeType(type),
    ensureHasMetaContainer,
    ensureHasSymbol
  )(R.merge(factory(), props));
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