var resolvers = [];
var scanners = [];

exports.registerResolver = function(resolver) {
  resolvers.push(resolver);
};

exports.registerScanner = function(scanner) {
  scanners.push(scanner);
};

exports.linkTo = function(entityId) {
  var i, href;

  if (!href) {
    for (i = 0; i < resolvers.length; ++i) {
      href = resolvers[i](entityId);

      if (href) {
        break;
      }
    }
  }

  return href;
};

exports.linkify = function(docstring) {
  var linked = ''+docstring;

  scanners.forEach(function(scanner) {
    linked = scanner(linked, exports.linkTo);
  });

  return linked;
};