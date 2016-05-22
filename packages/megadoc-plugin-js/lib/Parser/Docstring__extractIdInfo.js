var K = require('./constants');
var findWhere = require('lodash').findWhere;

function extractIdInfo(tags) {
  var id, namespace;

  // extract the module id from a @module tag:
  var moduleTag = findWhere(tags, { type: 'module' });
  if (moduleTag) {
    id = moduleTag.explicitModule;
    // var moduleId = moduleTag.string.match(/^([\w\.]+)\s*$|^([\w\.]+)\s*\n/);

    // if (moduleId) {
    //   id = moduleId[1] || moduleId[2];
    // }
  }

  // extract the namespace from a @namespace tag:
  var nsTag = findWhere(tags, { type: 'namespace' });
  if (nsTag) {
    var namespaceString = nsTag.explicitNamespace;// nsTag.string.split('\n')[0].trim();

    if (namespaceString.length) {
      namespace = namespaceString;
    }
    else {
      console.warn('@namespace tag must have a name.');
    }
  }
  // check for inline namespaces found in a module id string
  else if (id && id.indexOf(K.NAMESPACE_SEP) > -1) {
    namespace = id
      .split(K.NAMESPACE_SEP)
      .slice(0, -1)
      .join(K.NAMESPACE_SEP)
    ;
  }

  var methodTag = findWhere(tags, { type: 'method' });

  if (methodTag && methodTag.typeInfo.name) {
    id = methodTag.typeInfo.name;
  }

  var propertyTag = findWhere(tags, { type: 'property' });

  if (propertyTag && propertyTag.typeInfo.name) {
    id = propertyTag.typeInfo.name;
  }

  return {
    id: id,
    namespace: namespace
  };
}

module.exports = extractIdInfo;