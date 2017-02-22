var K = require('jsdoc-parser-extended').Constants;

function inc(set, key) {
  if (!set[key]) {
    set[key] = 0;
  }

  set[key] += 1;
}

module.exports = function(database) {
  var stats = {};

  stats.count = 0;
  stats.namespaces = {
    count: 0
  };

  stats.modules = {
    count: 0,
    types: {}
  };

  stats.entities = {
    count: 0,
    scopes: {}
  };

  stats.tags = {
    count: 0
  };

  database.documents.forEach(statDoc);

  function statDoc(documentNode) {
    var doc = documentNode.properties;

    if (!doc) {
      stats.namespaces.count += 1;
    }
    else {
      stats.modules.count += 1;
      stats.count += 1;

      inc(stats.modules.types, doc && doc.type || K.TYPE_UNKNOWN);
      statTags(doc.tags);
    }

    documentNode.entities.forEach(statEntity);
    documentNode.documents.forEach(statDoc);
  }

  function statEntity(node) {
    var doc = node.properties;

    stats.entities.count += 1;
    stats.count += 1;

    inc(stats.entities.scopes, doc.nodeInfo && doc.nodeInfo.scope || K.SCOPE_UNSCOPED);

    statTags(doc.tags);
  }

  function statTags(tags) {
    stats.tags.count += tags.length;

    tags.forEach(function(tag) {
      inc(stats.tags, tag.type);
    });
  }

  return stats;
};