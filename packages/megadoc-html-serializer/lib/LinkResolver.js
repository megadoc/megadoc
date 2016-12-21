var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var URI = require('urijs');
var dumpNodeFilePath = require('megadoc-corpus').dumpNodeFilePath;

/**
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
  this.options.ignore = this.options.ignore || {};
  this.defaultInjectors = this.options.injectors || [
    LinkResolver.MegadocLinkInjector,
    LinkResolver.MediaWikiLinkInjector,
  ];

  return this;
}

LinkResolver.MegadocLinkInjector = require('./LinkResolver__MegadocLinkStrategy');
LinkResolver.MediaWikiLinkInjector = require('./LinkResolver__MediaWikiLinkStrategy');

/**
 * Look up an item and generate a URL to it, if found.
 *
 * @param {String} params.path
 *        The index path.
 *
 * @param {T.Node} params.contextNode
 *        The node we're resolving from.
 *
 * @return {Object} link
 * @return {String} link.href
 * @return {String} link.title
 */
LinkResolver.prototype.lookup = function(params) {
  assert(typeof params.path === 'string',
    "A lookup requires at least a @path to be specified.");

  if (params.path.length === 0) {
    console.warn("%s: Link seems to be empty...", dumpNodeFilePath(params.contextNode));
    return;
  }

  if (process.env.VERBOSE) {
    console.log('Resolving link to "%s" from "%s"...',
      params.path,
      dumpNodeFilePath(params.contextNode)
    );
  }

  var document = this.corpus.resolve({
    text: params.path,
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
        path: params.path,
        contextNode: params.contextNode,
        resolvedDocument: document
      });

      return {
        text: document.title,
        title: document.summary,
        href: Href(document, this.options)
      };
    }
  }

  function Href(node, options) {
    // handle links to self or links from an entity to parent
    if (params.contextNode === node || (
        params.contextNode &&
        params.contextNode.type === 'DocumentEntity' &&
        params.contextNode.parentNode === node
      )) {
      return node.meta.href;
    }

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
  var renderLink = this.renderLink.bind(this, params);
  var injectors = params.injectors || this.defaultInjectors;

  return injectors.reduce(function(str, injector) {
    return injector(str, renderLink);
  }, String(params.text || ''));
};

/**
 * @private
 *
 * @param {Object} params
 * @param {T.Node} params.contextNode
 * @param {Boolean} [params.strict=true]
 *        Will warn when enabled and the link could not be resolved.
 *
 * @param {String} params.format
 *        One of "html" or "markdown".
 *
 * @param {Object} descriptor
 * @param {String} descriptor.source
 *        The source string that generated this link. This must be present so
 *        that we can use it if the link could not be resolved, in which case
 *        we'll use it as a text for a "broken" anchor that will be highlighted
 *        in the UI.
 *
 * @param {String} descriptor.path
 *        The index path to resolve.
 *
 * @param {String} [descriptor.text]
 *        Will be used as the anchor's text. If not specified, we'll use the
 *        document's title in its place.
 *
 * @param {String} [descriptor.title]
 *        Will be used as the anchor's [title] attribute (a tooltip). If not
 *        specified, we'll use the document's summary in its place.
 *
 * @return {String}
 */
LinkResolver.prototype.renderLink = function(params, descriptor) {
  var format = params.format || 'markdown';
  var strict = params.strict !== false;
  var link = this.lookup({ path: descriptor.path, contextNode: params.contextNode });

  assert(descriptor.hasOwnProperty('source'),
    "Link descriptor must contain a @source attribute!");

  if (!link && !strict) {
    return descriptor.source;
  }
  else if (!link && strict) {
    if (!params.contextNode || !(params.contextNode.uid in this.options.ignore)) {
      console.warn('%s: Unable to resolve link to "%s" (from: "%s")',
        dumpNodeFilePath(params.contextNode),
        descriptor.path,
        params.contextNode ? params.contextNode.uid : '<<unknown>>'
      );
    }

    return generateMarkup({
      format: format,
      href: '',
      text: descriptor.text || descriptor.path,
      title: descriptor.title,
    });
  }

  return generateMarkup({
    format: format,
    href: link.href,
    text: descriptor.text || link.text,
    title: descriptor.title || link.title,
  });
};

function generateMarkup(params) {
  if (params.format === 'html') {
    return generateHTMLLink(params.href, params.text, params.title);
  }
  else if (params.format === 'markdown') {
    return generateMarkdownLink(params.href, params.text, params.title);
  }
  else {
    console.warn("Unknown format '%s' passed to #linkify, it can be either 'html' or 'markdown'.",
      params.format
    );

    return '';
  }
}

function generateMarkdownLink(href, text, title) {
  var buffer = '[' + text + '](mega://' + href;

  if (title) {
    buffer += ' "' + title.replace(/\n/g, ' ') + '"';
  }

  buffer += ')';

  return buffer;
}

// TODO: DRY alert, see ./Renderer__renderLink.js
function generateHTMLLink(href, text, title) {
  var className = href && href.length ?
    "mega-link--internal" :
    "mega-link--internal mega-link--broken"
  ;

  var buffer = '<a class="' + className + '"';

  if (href && href.length) {
    buffer += ' href="' + href + '"';
  }

  if (title) {
    buffer += ' title="' + title + '"';
  }

  buffer += '>' + text + '</a>';

  return buffer; // TODO: shouldn't we escape this?
}

module.exports = LinkResolver;