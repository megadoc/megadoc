var marked = require('marked');
var summaryExtractor = SummaryExtractor();
var htmlparser = require("htmlparser2");

var markdownToTextOptions = Object.freeze({
  tables: false,
  smartLists: false,
  sanitize: false,
  breaks: false,
  linkify: false
});

/**
 * @module
 * @namespace RendererUtils
 *
 * Strip HTML from a string and get some plain text.
 *
 * @param  {String} html
 *         A string containing HTML entities.
 *
 * @return {String}
 *         The string without any HTML entities.
 */
function htmlToText(html) {
  var buf = '';
  var parser = new htmlparser.Parser({
    ontext: function(text){
      buf += text;
    }
  }, {decodeEntities: true});

  parser.write(html);

  return buf;
}

/**
 * @module
 * @namespace RendererUtils
 *
 * Convert a block of Markdown to plain-text.
 *
 * @param {String} markdown
 *
 * @return {String}
 *         The plain-text (no HTML inside of it) string.
 */
function markdownToText(md) {
  return htmlToText(marked(md, markdownToTextOptions));
}

/**
 * @module
 * @namespace RendererUtils
 *
 * Convert a markdown heading string to URL-friendly plain-text string.
 *
 * @param {String} str
 *        Only the first line of the string will be processed.
 *
 * @param {Boolean} [isMarkdown=true]
 *        If false, no implicit rendering to text is done. Pass this if you
 *        already called [markdownToText]() on your string or you know it contains
 *        no markdown (or HTML).
 *
 * @return {String}
 */
function normalizeHeading(str) {
  return str.split('\n')[0]
    .trim()
    .replace(/\W+/g, '-')
    .replace(/^[\-]+|[\-]+$/g, '') // leading and trailing -
    .toLowerCase()
  ;
}

/**
 * @module
 * @namespace RendererUtils
 *
 * Strip an HTML block of a surrounding `<p></p>`.
 *
 * @param  {String} html
 * @return {String}
 */
function trimHTML(html) {
  return html.replace('<p>', '').replace('</p>', '').trim();
}

/**
 * @module
 * @namespace RendererUtils
 *
 * Extract the first paragraph of text from a Markdown block of text.
 *
 * @param {String} markdown
 * @param {Object} options
 * @param {Boolean} options.plainText
 *        Pass true if you want the summary in plain-text as opposed to HTML.
 *
 * @return {String}
 *         The first paragraph, or the summary.
 */
function extractSummary(markdown, options) {
  var summaryHTML = summaryExtractor(markdown);

  if (options && options.plainText) {
    return htmlToText(summaryHTML);
  }

  return summaryHTML;
}

exports.htmlToText = htmlToText;
exports.markdownToText = markdownToText;
exports.normalizeHeading = normalizeHeading;
exports.trimHTML = trimHTML;
exports.extractSummary = extractSummary;

function SummaryExtractor() {
  var summary;
  var renderer = new marked.Renderer();
  var markedOptions = Object.freeze({
    renderer: renderer,
    gfm: true,
    tables: false,
    sanitize: true,
    breaks: false,
    linkify: false,
    pedantic: false,
  });

  // this could be heavily optimized, but meh for now
  renderer.paragraph = function(text) {
    if (!summary) {
      summary = text; // first paragraph only
    }
  };

  return function extractFirstParagraph(markdown) {
    var parsedSummary;

    if (!markdown) {
      return null;
    }

    summary = null;

    marked(markdown, markedOptions);
    parsedSummary = summary || '';

    summary = null;

    return markdownToText('<p>' + parsedSummary + '</p>');
  };
}
