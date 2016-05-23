var K = require('./constants');
var findWhere = require('lodash').findWhere;

function extractIdInfo(tags) {
  var name, id;
  var namespace = getNameFromTag(tags, 'namespace');
  var fqid = id = getNameFromTag(tags, 'module');

  // check for inline namespaces found in a module id string
  if (fqid && fqid.indexOf(K.NAMESPACE_SEP) > -1) {
    if (namespace) {
      console.warn(
        "Document '%s' already has a namespace specified using the " +
        "@namespace tag, it should not have a namespace in its name as well.",
        fqid
      );
    }

    namespace = fqid
      .split(K.NAMESPACE_SEP)
      .slice(0, -1)
      .join(K.NAMESPACE_SEP)
    ;
  }

  // try getting the ID from other tags, but these do not allow implicit
  // namespacing:
  if (!id) {
    id = (
      getNameFromTag(tags, 'name') ||
      getNameFromTag(tags, 'method') ||
      getNameFromTag(tags, 'property')
    );
  }

  if (id && namespace && id.indexOf(namespace + K.NAMESPACE_SEP) === 0) {
    name = id.substr(namespace.length + 1);
  }
  else {
    name = id;
  }

  return {
    name: name,
    namespace: namespace
  };
}

module.exports = extractIdInfo;

function getNameFromTag(tags, tagType) {
  var tag = findWhere(tags, { type: tagType });

  if (tag && tag.typeInfo.name) {
    return tag.typeInfo.name;
  }
}