var K = require('../constants');

function isMethod(doc) {
  var ctx = doc.ctx;

  return ctx.type === 'function' && (
    ctx.scope === K.SCOPE_FACTORY_EXPORTS ||
    ctx.scope === K.SCOPE_INSTANCE ||
    ctx.scope === K.SCOPE_PROTOTYPE
  );
}

function isFactoryExports(doc) {
  return doc.ctx.scope === K.SCOPE_FACTORY_EXPORTS;
}

function isClassEntity(doc) {
  return (
    doc.ctx.scope === K.SCOPE_INSTANCE ||
    doc.ctx.scope === K.SCOPE_PROTOTYPE
  );
}

function isStaticMethod(doc) {
  return doc.ctx.type === 'function' && !isMethod(doc);
}

exports.isMethod = isMethod;
exports.isStaticMethod = isStaticMethod;
exports.isFactoryExports = isFactoryExports;
exports.isClassEntity = isClassEntity;

exports.getDisplayType = function(documentNode) {
  if (documentNode.type === 'Namespace') {
    return 'Library';
  }

  if (!documentNode.properties) {
    return 'Namespace';
  }
  else if (documentNode.entities.some(n => isClassEntity(n.properties))) {
    return 'Class';
  }
  else if (documentNode.entities.some(n => isFactoryExports(n.properties))) {
    return 'Factory';
  }
  else if (documentNode.properties.ctx.type === K.TYPE_FUNCTION) {
    return 'Function';
  }
  else {
    return 'Object';
  }
};

exports.isProperty = function(doc) {
  return doc && doc.tags.some(x => x.type === 'property');
};

exports.isStaticProperty = function(doc) {
  return exports.isProperty(doc) && [
    K.SCOPE_PROTOTYPE,
    K.SCOPE_INSTANCE
  ].indexOf(doc.ctx.scope) === -1;
};

exports.isMemberProperty = function(doc) {
  return exports.isProperty(doc) && !exports.isStaticProperty(doc);
};