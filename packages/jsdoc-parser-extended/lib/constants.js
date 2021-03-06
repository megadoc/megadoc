exports.NAMESPACE_SEP = '.';

exports.SCOPE_UNSCOPED = undefined;
exports.SCOPE_INSTANCE = 'instance';
exports.SCOPE_PROTOTYPE = 'prototype';
exports.SCOPE_FACTORY_EXPORTS = 'factory_exports';

exports.TYPE_OBJECT = 'Object';
exports.TYPE_OBJECT_PROPERTY = 'ObjectProperty';
exports.TYPE_DEFAULT_EXPORTS = 'exports';
exports.TYPE_FACTORY = 'Factory';
exports.TYPE_FUNCTION = 'Function';
exports.TYPE_CLASS = 'Class';
exports.TYPE_ARRAY = 'Array';
exports.TYPE_UNKNOWN = 'Unknown';
exports.TYPE_LITERAL = 'Literal';
exports.TYPE_ALL_LITERAL = 'AllLiteral';
exports.TYPE_UNKNOWN_LITERAL = 'UnknownLiteral';
exports.TYPE_UNION = 'Union';

exports.VISIBILITY_PROTECTED = 'protected';
exports.VISIBILITY_PRIVATE = 'private';

exports.DEFAULT_FACTORY_EXPORTS_ID = 'default_exports';
exports.TYPE_OVERRIDING_TAGS = {
  'method': true,
  'property': true,
  'type': true,
  'class': true,
  'export': true,
};

exports.TAGS_WITH_STRINGS = {
  'deprecated': true,
  'example': true,
};

exports.NO_DESCRIPTION_TAGS = {
  'alias': true,
  'class': true,
  'constructor': true,
  'extends': true,
  'inheritdoc': true,
  'memberOf': true,
  'method': true,
  'mixin': true,
  'mixes': true,
  'module': true,
  'namespace': true,
  'preserveOrder': true,
  'private': true,
  'public': true,
  'type': true,
  'typedef': true,
};

exports.KNOWN_TAGS = [
  'alias',
  'async',
  'callback',
  'class',
  'constructor',
  'deprecated',
  'example',
  'export',
  'extends',
  'interface',
  'lends',
  'memberOf',
  'method',
  'mixes',
  'module',
  'name',
  'namespace',
  'param',
  'preserveOrder',
  'private',
  'public',
  'property',
  'protected',
  'return',
  'see',
  'static',
  'throws',
  'type',
  'typedef'
];
