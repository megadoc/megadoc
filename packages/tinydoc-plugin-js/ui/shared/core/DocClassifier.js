var K = require('constants');

function isModule(doc) {
  return doc.isModule();
}

function isEntity(doc) {
  return !doc.isModule();
}

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

exports.isModule = isModule;
exports.isEntity = isEntity;
exports.isMethod = isMethod;
exports.isStaticMethod = isStaticMethod;
exports.isFactoryExports = isFactoryExports;
exports.isClassEntity = isClassEntity;
