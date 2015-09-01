const { findWhere } = require('lodash');

var resolvers = [];
var scanners = [ require('./LinkResolver/resolveLinksInMarkdown') ];

let LinkResolver = exports;
let globalContext;

LinkResolver.registerResolver = function(namespace, resolve) {
  resolvers.push({ namespace, resolve });
};

LinkResolver.registerScanner = function(scanner) {
  scanners.push(scanner);
};

LinkResolver.linkTo = function(entityId, context={}) {
  var i, href;
  let contextResolver;

  // if (process.env.VERBOSE) {
  //   console.debug('Resolving link to %s in context %s', entityId, JSON.stringify(context));
  // }

  if (context.namespace) {
    contextResolver = findWhere(resolvers, { namespace: context.namespace });

    if (contextResolver) {
      console.debug("Using custom namespace resolver '%s'", context.namespace);
      href = contextResolver.resolve(entityId, context);
    }
    else {
      console.warn(
        "No link resolver is registered to handle links starting with '%s::'",
        context.namespace
      );
    }
  }

  if (!href) {
    for (i = 0; i < resolvers.length; ++i) {
      let resolver = resolvers[i];
      if (resolver !== contextResolver) {
        href = resolver.resolve(entityId, context);

        if (href) {
          break;
        }
      }
    }
  }

  return href;
};

LinkResolver.linkify = function(docstring, context) {
  var linked = ''+docstring;

  scanners.forEach(function(scanner) {
    linked = scanner(linked, LinkResolver.linkTo, context || globalContext);
  });

  return linked;
};

LinkResolver.setContext = function(_globalContext) {
  console.debug('LinkResolver: now in context "%s"', JSON.stringify(_globalContext));
  globalContext = _globalContext;
};