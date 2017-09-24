var marked = require('marked');
var markdownToText = require("./markdownToText");
var htmlToText = require("./htmlToText");
var summaryExtractor = SummaryExtractor();

/**
 * @module
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

function SummaryExtractor() {
  var summary;
  var renderer = new marked.Renderer();
  var markedOptions = ({
    renderer: renderer,
    gfm: true,
    tables: false,
    sanitize: false,
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
    parsedSummary = (summary || '').replace(/\n+/g, ' ');

    summary = null;

    return markdownToText('<p>' + parsedSummary + '</p>');
  };
}

module.exports = extractSummary;
