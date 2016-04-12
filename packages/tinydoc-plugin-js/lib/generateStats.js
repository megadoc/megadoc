var K = require('./Parser/constants');

function inc(set, key) {
  if (!set[key]) {
    set[key] = 0;
  }

  set[key] += 1;
}

module.exports = function(database) {
  var stats = {};

  stats.count = database.length;
  stats.modules = {
    count: 0,
    types: {}
  };

  stats.entities = {
    count: 0,
    scopes: {}
  };

  database.forEach(function(doc) {
    if (doc.isModule) {
      stats.modules.count += 1;
      inc(stats.modules.types, doc.ctx ? doc.ctx.type : K.TYPE_UNKNOWN);
    }
    else {
      stats.entities.count += 1;
      inc(stats.entities.scopes, doc.ctx.scope || 'unscoped');
    }
  });

  return stats;
};