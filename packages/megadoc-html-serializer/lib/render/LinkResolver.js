const assert = require('assert');
const invariant = require('invariant');
const EventEmitter = require('events').EventEmitter;
const URI = require('urijs');
const dumpNodeFilePath = require('megadoc-corpus').dumpNodeFilePath;
const { escape: escapeHTML } = require('lodash');
const { NoBrokenLinks } = require('../lintingRules')
const LinkToSelf = {};

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
  this.options.ignore = this.options.ignore || {};
  this.defaultInjectors = this.options.injectors || [
    LinkResolver.MegadocLinkInjector,
    LinkResolver.MediaWikiLinkInjector,
  ];

  this.linter = options.linter;

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
  const { linter } = this;

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

  var index = this.corpus.resolve({
    text: params.path,
    contextNode: params.contextNode
  });

  if (!index) {
    return null;
  }

  var node = index.node;
  var text = node.title || index.text;

  if (!node.meta.href) {
    linter.logError({
      message: "Document can not be linked to as it has no @href.",
      loc: linter.locationForNode(node)
    });

    return null;
  }
  else if (!text) {
    linter.logError({
      message: "Document can not be linked to as it has no @title.",
      loc: linter.locationForNode(node)
    })

    return null;
  }
  else {
    return {
      text: text,
      title: node.summary,
      href: Href(node, params.contextNode)
    };
  }
};

function Href(node, contextNode) {
  const relativeHref = URI(node.meta.href).relativeTo(contextNode.meta.href).toString();

  // handle links to self or links from an entity to parent since the relative
  // href will be empty and will be marked as a broken link when in fact it
  // isn't, so we just use the absolute href:
  if (relativeHref.length === 0) {
    return LinkToSelf;
  }

  return relativeHref;
}

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
  invariant(params.contextNode,
    `linkify requires a contextNode to be set!`
  );

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
  const format = params.format || 'markdown';
  const contextNode = this.corpus.get(params.contextNode.uid);
  const index = this.lookup({
    path: descriptor.path,
    contextNode
  });

  assert(descriptor.hasOwnProperty('source'),
    "Link descriptor must contain a @source attribute!");

  if (index) {
    return generateMarkup({
      format: format,
      href: index.href,
      text: descriptor.text || index.text,
      title: descriptor.title || index.title,
    });
  }
  else {
    this.linter.logRuleEntry({
      rule: NoBrokenLinks,
      params: descriptor,
      loc: this.linter.locationForNode(contextNode),
    });

    return generateMarkup({
      format: format,
      href: '',
      text: descriptor.text || descriptor.path,
      title: descriptor.title,
    });
  }

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
  var buffer = '[' + text + ']';

  if (href === LinkToSelf) {
    buffer += '(mega://link-to-self';
  }
  else if (href) {
    buffer += '(mega://' + encodeURI(href);
  }
  else {
    buffer += '(mega://';
  }

  if (title) {
    buffer += ' "' + normalizeTitle(title) + '"';
  }

  buffer += ')';

  return buffer;
}

// TODO: DRY alert, see ./Renderer__renderLink.js
function generateHTMLLink(href, text, title) {
  var className;

  if (href === LinkToSelf) {
    className = "mega-link--internal mega-link--active";
  }
  else if (href) {
    className = "mega-link--internal";
  }
  else {
    className = "mega-link--internal mega-link--broken";
  }

  var buffer = '<a class="' + escapeHTML(className) + '"';

  if (href && href !== LinkToSelf) {
    buffer += ' href="' + encodeURI(href) + '"';
  }

  if (title) {
    buffer += ' title="' + escapeHTML(normalizeTitle(title)) + '"';
  }

  buffer += '>' + escapeHTML(text) + '</a>';

  return buffer;
}

function normalizeTitle(title) {
  return title.replace(/\n+/g, ' ');
}

module.exports = LinkResolver;