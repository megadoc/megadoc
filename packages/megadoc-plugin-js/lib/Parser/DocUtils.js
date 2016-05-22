var K = require('./constants');

exports.getTypeOf = function(doc) {
  if (doc.docstring.hasTypeOverride()) {
    return doc.docstring.getTypeOverride();
  }
  else if (doc.nodeInfo.ctx.type) {
    return doc.nodeInfo.ctx.type;
  }

  return K.TYPE_UNKNOWN;
};

exports.getTypeNameOf = function(doc) {
  var type = exports.getTypeOf(doc);

  return type.name || type;
};

exports.isOfType = function(doc, expectedTypeName) {
  var typeName = exports.getTypeNameOf(doc);

  return typeName === expectedTypeName;
};
