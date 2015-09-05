var console = require('./Logger')('LinkResolver');
var RE_TINY_LINK = Object.freeze(/(.?)\[([^\]]+)\]\(\)/g);

function LinkResolver(registry) {
  this.registry = registry;
  this.resolvers = [];
}

LinkResolver.prototype.use = function(resolve) {
  this.resolvers.push(resolve);
};

LinkResolver.prototype.lookup = function(objectPath) {
  var link, i;

  if (process.env.VERBOSE) {
    console.debug('Resolving link to %s using %d resolvers...',
      objectPath,
      this.resolvers.length
    );
  }

  for (i = 0; i < this.resolvers.length; ++i) {
    if ((link = this.resolvers[i](objectPath, this.registry))) {
      break;
    }
  }

  return link;
};

LinkResolver.prototype.linkify = function(docstring) {
  var lookup = this.lookup.bind(this);

  return String(docstring)
    // resolve links with no URI; the title is the path to the object, e.g.:
    //
    //     [Module]()
    //     [Module#method]()
    //     [Module@prop]()
    //     [Module.staticMethod]()
    .replace(RE_TINY_LINK, function(original, leadingChar, path) {
      var link, title, fragments, customTitle;
      var objectPath = path;

      // ignore links that were escaped by a leading \
      if (leadingChar === '\\') {
        return original.substr(1);
      }

      if (path.indexOf(' ') > -1) {
        fragments = path.split(' ');
        objectPath = fragments.shift();
        customTitle = fragments.join(' ');
      }

      link = lookup(objectPath);

      if (link) {
        title = customTitle || link.title || objectPath;
        return leadingChar + '[' + title + '](tiny://' + link.href + ')';
      }
      else {
        console.warn('Unable to resolve link to "' + objectPath + '"');
        return leadingChar + '[' + objectPath + ']';
      }
    })
  ;
};

module.exports = LinkResolver;