var omit = require('lodash').omit;
var EventEmitter = require('events').EventEmitter;
var RE_TINY_LINK = Object.freeze(/(.?)\[(.+?)\]\(\)/g);
var URI = require('urijs');

/**
 * @namespace Core
 *
 * @param {Core.Registry} registry
 *        The registry of indices the resolver will use to resolve links.
 */
function LinkResolver(registry, corpus, options) {
  this.registry = registry;
  this.corpus = corpus;
  this.resolvers = [];

  this.emitter = new EventEmitter();
  this.on = this.emitter.on.bind(this.emitter);
  this.off = this.emitter.removeListener.bind(this.emitter);
  this.options = options || {};
  this.options.linkSuffix = (options || {}).linkSuffix || '';

  return this;
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
 * @return {Object?} link
 *         If the index was resolved, this object would contain the necessary
 *         data to construct an HTML link.
 *
 * @return {String} link.href
 *         The `@href` to the object.
 *
 * @return {String} link.title
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
 *           href: "/articles/" + encodeURIComponent(article.id),
 *           title: article.title
 *         };
 *       }
 *     });
 */
LinkResolver.prototype.use = function(resolve) {
  console.warn(
    'Deprecated: linkResolver.use() is no longer supported, please  switch to ' +
    ' using the Corpus in its place.'
  );

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
LinkResolver.prototype.lookup = function(objectPath, params) {
  var link, i;

  params = params || {};

  if (process.env.VERBOSE) {
    console.log('Resolving link to %s using %d resolvers...',
      objectPath,
      this.resolvers.length
    );
  }

  var document = this.corpus.resolve({
    text: objectPath,
    contextNode: params.contextNode
  });

  if (document) {
    if (!document.meta.href) {
      // TODO: linter
      console.warn("Document '%s' can not be linked to as it has no @href.", document.uid);
      return;
    }
    else if (!document.title) {
      // TODO: linter
      console.warn("Document '%s' can not be linked to as it has no @title.", document.uid);
      return;
    }
    else {
      return {
        title: document.title,
        href: Href(document, this.options)
      };
    }
  }

  // DEPRECATED / backwards compatibility
  for (i = 0; i < this.resolvers.length; ++i) {
    if ((link = this.resolvers[i](objectPath, this.registry, params.context))) {
      break;
    }
  }

  this.emitter.emit('lookup', {
    objectPath: objectPath,
    source: params.source,
    context: params.context,
    link: link
  });

  function Href(node, options) {
    var href;

    if (params.contextNode && params.contextNode.meta.href) {
      href = URI(node.meta.href).relativeTo(params.contextNode.meta.href).toString();
    }
    else {
      href = node.meta.href;
    }

    return href;
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
 *     LinkResolver.linkify('See \[Module]() for more info.');
 *     // => "See [ModuleTitle](/internal/path/to/module) for more info."
 *
 */
LinkResolver.prototype.linkify = function(_docstring, _context, _options) {
  var params = {
    text: _docstring,
    context: _context,
    options: _options
  };

  if (arguments.length === 1 && typeof _docstring === 'object') {
    params = _docstring;
  }

  var docstring = params.text;
  var options = params.options || {};

  var lookup = this.lookup.bind(this);
  var strict = options.strict !== false;

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

      link = lookup(objectPath, params);

      if (link) {
        if (options.useOriginalTitle) {
          title = objectPath;
        }
        else {
          title = customTitle || link.title || objectPath;
        }

        return leadingChar + '[' + title + '](tiny://' + link.href + ')';
      }
      else {
        if (!strict) {
          return objectPath;
        }
        else {
          console.warn('Unable to resolve link to "%s" (context: "%s")',
            objectPath,
            params.contextNode ?
              params.contextNode.uid :
              JSON.stringify(omit(params, ['text']))
          );

          return leadingChar + '[' + objectPath + ']';
        }
      }
    })
  ;
};

module.exports = LinkResolver;