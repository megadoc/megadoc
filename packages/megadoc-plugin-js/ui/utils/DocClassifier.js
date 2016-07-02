var K = require('../constants');

function isMethod(doc) {
  var ctx = doc.nodeInfo;

  return doc.type === K.TYPE_FUNCTION && (
    ctx.scope === K.SCOPE_FACTORY_EXPORTS ||
    ctx.scope === K.SCOPE_INSTANCE ||
    ctx.scope === K.SCOPE_PROTOTYPE
  );
}

function isFactoryExports(doc) {
  return doc.nodeInfo.scope === K.SCOPE_FACTORY_EXPORTS;
}

function isClassEntity(doc) {
  return (
    doc.nodeInfo.scope === K.SCOPE_INSTANCE ||
    doc.nodeInfo.scope === K.SCOPE_PROTOTYPE
  );
}

function isStaticMethod(doc) {
  return doc.type === K.TYPE_FUNCTION && !isMethod(doc);
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
  else if (documentNode.properties.type === K.TYPE_FUNCTION) {
    return 'Function';
  }
  else {
    return 'Object';
  }
};

exports.isProperty = function(doc) {
  return doc && doc.tags && doc.tags.some(x => x.type === 'property');
};

exports.isStaticProperty = function(doc) {
  return exports.isProperty(doc) && [
    K.SCOPE_PROTOTYPE,
    K.SCOPE_INSTANCE
  ].indexOf(doc.nodeInfo.scope) === -1;
};

exports.isMemberProperty = function(doc) {
  return exports.isProperty(doc) && !exports.isStaticProperty(doc);
};

exports.isPrivate = function(doc) {
  return doc && doc.tags && doc.tags.some(x => x.type === 'private');
};

exports.isProtected = function(doc) {
  return doc && doc.tags && doc.tags.some(x => x.type === 'protected');
};
