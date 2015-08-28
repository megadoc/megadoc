var K = require('./constants');

function isModule(doc) {
  return doc.isModule();
}

function isEntity(doc) {
  return !doc.isModule();
}

function isMethod(doc) {
  var ctx = doc.nodeInfo.ctx;

  return ctx.type === K.TYPE_FUNCTION && (
    ctx.scope === K.SCOPE_FACTORY_EXPORTS ||
    ctx.scope === K.SCOPE_INSTANCE ||
    ctx.scope === K.SCOPE_PROTOTYPE
  );
}

function isStaticMethod(doc) {
  return doc.nodeInfo.ctx.type === K.TYPE_FUNCTION && !isMethod(doc);
}

exports.isModule = isModule;
exports.isEntity = isEntity;
exports.isMethod = isMethod;
exports.isStaticMethod = isStaticMethod;
