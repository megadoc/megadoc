var findWhere = require('lodash').findWhere;
var Logger = require('../../lib/Logger');
// var console = new Logger('cjs-linker');

module.exports = function(docs) {
  var indices = [];

  docs.forEach(function(doc) {
    var index;
    var paths = [];

    if (doc.isModule) {
      index = { id: doc.id };

      paths.push(doc.id);
      paths.push(doc.name);
    }
    else {
      var parentDoc = findWhere(docs, { id: doc.receiver });

      if (!parentDoc) {
        console.warn('Unable to find parent "%s" for entity "%s"', doc.receiver, doc.id);
      }
      else {
        index = {
          id: doc.id,
          parent: parentDoc.id
        };

        paths.push([ parentDoc.id, doc.name ].join(doc.ctx.symbol));
        paths.push([ parentDoc.name, doc.name ].join(doc.ctx.symbol));
      }
    }

    if (index) {
      index.type = 'cjs';

      if (doc.alias) {
        paths.push(doc.alias);
        console.log('Using alias "%s" for "%s"', doc.alias, doc.id);
      }

      paths.forEach(function(path) {
        indices.push({ path: path, index: index });
      });
    }
  });

  return indices;
};