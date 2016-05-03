var K = require('./Parser/constants');

function inc(set, key) {
  if (!set[key]) {
    set[key] = 0;
  }

  set[key] += 1;
}

module.exports = function(database) {
  var stats = {};

  stats.count = 0;
  stats.modules = {
    count: 0,
    types: {}
  };

  stats.entities = {
    count: 0,
    scopes: {}
  };

  database.documents.forEach(statDoc);

  function statDoc(documentNode) {
    var doc = documentNode.properties;

    stats.modules.count += doc ? 1 : 0;
    stats.count += doc ? 1 : 0;
    inc(stats.modules.types, doc && doc.ctx ? doc.ctx.type : K.TYPE_UNKNOWN);

    (documentNode.entities || []).forEach(function(entityNode) {
      var entityDoc = entityNode.properties;

      stats.entities.count += 1;
      stats.count += 1;

      inc(stats.entities.scopes, entityDoc.ctx && entityDoc.ctx.scope || 'unscoped');
    });

    documentNode.documents.forEach(statDoc);
  }

  return stats;
};