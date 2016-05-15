var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var RE_MEGA_LINK = Object.freeze(/(.?)\[(.+?)\]\(\)/g);
var URI = require('urijs');

/**
 * @namespace Core
 *
 * @param {Corpus} corpus
 *        The corpus of documents.
 */
function LinkResolver(corpus, options) {
  this.corpus = corpus;
  this.resolvers = [];

  this.emitter = new EventEmitter();
  this.on = this.emitter.on.bind(this.emitter);
  this.off = this.emitter.removeListener.bind(this.emitter);
  this.options = options || {};
  this.options.relativeLinks = this.options.relativeLinks !== false;

  return this;
}

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
  params = params || {};

  if (process.env.VERBOSE) {
    console.log('Resolving link to "%s" from "%s"...',
      objectPath,
      params.contextNode ? params.contextNode.uid : '<<unknown>>'
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
      this.emitter.emit('lookup', {
        objectPath: objectPath,
        contextNode: params.contextNode,
        resolvedDocument: document
      });

      return {
        title: document.title,
        href: Href(document, this.options)
      };
    }
  }

  function Href(node, options) {
    if (params.contextNode && params.contextNode.meta.href && options.relativeLinks) {
      return URI(node.meta.href).relativeTo(params.contextNode.meta.href).toString();
    }
    else {
      return node.meta.href;
    }
  }
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
LinkResolver.prototype.linkify = function(params) {
  assert(arguments.length === 1, "Deprecated: use linkify() with an object!");

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
    .replace(RE_MEGA_LINK, function(original, leadingChar, path) {
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
              params
          );

          return leadingChar + '[' + objectPath + ']';
        }
      }
    })
  ;
};

module.exports = LinkResolver;