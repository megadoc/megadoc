var RE_TINY_LINK = Object.freeze(/(.?)\[(.+?)\]\(\)/g);

/**
 * @namespace Core
 *
 * @param {Core.Registry} registry
 *        The registry of indices the resolver will use to resolve links.
 */
function LinkResolver(registry) {
  this.registry = registry;
  this.resolvers = [];
}

/**
 * Add a resolver function that will try to generate a link for a given index.
 *
 * @param {Function} resolve
 *        The resolver function.
 *
 * @param {String} resolve.path
 *        The index path.
 *
 * @param {Object<String,Object>} resolve.indices
 *        The available registry indices.
 *
 * @return {Object|undefined} resolve
 *         If the index was resolved, this object would contain the necessary
 *         data to construct a URL.
 *
 * @return {String} resolve.href
 *         The `@href` to the object.
 *
 * @return {String} resolve.title
 *         The text to use for the link, unless it was overridden by the user.
 *
 * @example
 *
 *     LinkResolver.use(function(id, registry) {
 *       var index = registry[id];
 *
 *       if (index && index.type === 'markdown') {
 *         var article = lookupArticleById(index.articleId);
 *
 *         return {
 *           href: "/articles/" + article.id,
 *           title: article.title
 *         };
 *       }
 *     });
 */
LinkResolver.prototype.use = function(resolve) {
  this.resolvers.push(resolve);
};

/**
 * Look up an item and generate a URL to it, if found.
 *
 * @param  {String} objectPath
 *         The index path.
 *
 * @return {Object} link
 * @return {String} link.href
 * @return {String} link.title
 */
LinkResolver.prototype.lookup = function(objectPath, context) {
  var link, i;

  if (process.env.VERBOSE) {
    console.debug('Resolving link to %s using %d resolvers...',
      objectPath,
      this.resolvers.length
    );
  }

  for (i = 0; i < this.resolvers.length; ++i) {
    if ((link = this.resolvers[i](objectPath, this.registry, context))) {
      break;
    }
  }

  return link;
};

/**
 * Linkify all internal links found in a block of text.
 *
 * @param  {String} docstring
 *         The block of text possibly containing internal links.
 *
 * @return {String}
 *         The text with all the internal links that were successfully resolved
 *         replaced with markdown-formatted links.
 *
 * @example
 *
 *     LinkResolver.linkify('See [Module]() for more info.');
 *     // => "See [ModuleTitle](/internal/path/to/module) for more info."
 *
 */
LinkResolver.prototype.linkify = function(docstring, context, markUnlinked) {
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

      link = lookup(objectPath, context);

      if (link) {
        title = customTitle || link.title || objectPath;
        return leadingChar + '[' + title + '](tiny://' + link.href + ')';
      }
      else {
        if (markUnlinked === false) {
          return objectPath;
        }
        else {
          console.warn('Unable to resolve link to "' + objectPath + '"');
          return leadingChar + '[' + objectPath + ']';
        }
      }
    })
  ;
};

module.exports = LinkResolver;