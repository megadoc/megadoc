var generateURL = require('./generateURL');

exports.generateIndices = function(database, registry, config) {
  var indices = [];
  var routeName = config.routeName;

  database.forEach(function(doc) {
    var index, parentDoc;
    var paths = [];

    if (doc.isModule) {
      index = { id: doc.id };

      paths.push(doc.id);
      paths.push(doc.name);
      paths.push(doc.filePath);
    }
    else {
      parentDoc = database.filter(function(x) { return x.id === doc.receiver; })[0];

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
      index.routeName = routeName;
      index.link = generateURL(doc, parentDoc, config.routeName);

      doc.aliases.forEach(function(alias) {
        paths.push(alias);

        if (process.env.VERBOSE) {
          console.log('tinydoc-plugin-js[%s]: Using alias "%s" for "%s"', routeName, alias, doc.id);
        }
      });

      paths.forEach(function(path) {
        indices.push({ path: path, index: index });
      });
    }
  });

  return indices;
};

exports.generateSearchTokens = function(database, registry, config) {
  var tokens = [];

  database.forEach(function(doc) {
    var docTokens = {};
    var parentDoc;

    if (doc.isModule) {
      docTokens.$1 = doc.id;
      docTokens.$2 = doc.filePath;

      if (doc.aliases) {
        docTokens.$3 = doc.aliases[0];
      }
    }
    else {
      parentDoc = database.filter(function(x) { return x.id === doc.receiver; })[0];

      if (parentDoc) {
        docTokens.$1 = [ parentDoc.id, doc.name ].join(doc.ctx.symbol);
      }
    }

    if (docTokens.$1) {
      docTokens.link = {
        href: '/' + doc.href,
        context: config && config.corpusContext
      };

      tokens.push(docTokens);
    }
  });

  return tokens;
};