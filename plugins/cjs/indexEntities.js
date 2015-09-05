var findWhere = require('lodash').findWhere;
var Logger = require('../../lib/Logger');
var console = new Logger('cjs');

module.exports = function(docs) {
  var indices = [];

  docs.forEach(function(doc) {
    var context;
    var paths = [];

    if (doc.isModule) {
      context = { id: doc.id };

      paths.push(doc.id);
      paths.push(doc.name);
    }
    else if (doc.ctx) {
      switch(doc.ctx.type) {
        case 'method':
        case 'function':
        case 'property':
          var parentDoc = findWhere(docs, { id: doc.ctx.receiver });

          if (!parentDoc) {
            console.warn('Unable to find parent "%s" for entity "%s"', doc.ctx.receiver, doc.id);
          }
          else {
            context = {
              id: doc.id,
              parent: parentDoc.id
            };

            paths.push([ parentDoc.id, doc.name ].join(doc.symbol));
            paths.push([ parentDoc.name, doc.name ].join(doc.symbol));
          }
          break;
      }
    }

    if (context) {
      context.type = 'cjs';

      paths.forEach(function(path) {
        indices.push({ path: path, context: context });
      });
    }
  });

  return indices;
};