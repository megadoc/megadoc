var marked = require('marked');
var Utils = require('./Renderer/Utils');
var MarkdownRenderer = require('./Renderer/MarkdownRenderer');

var markedOptions = Object.freeze({
  // TODO: really inject config
  renderer: new MarkdownRenderer({}),
  sanitize: true,
  breaks: false,
  linkify: false
});

function Renderer() {
}

var Rpt = Renderer.prototype;

function trimHTML(html) {
  return html.replace('<p>', '').replace('</p>', '').trim();
}

Rpt.renderMarkdown = function(text, options) {
  var html = marked(text, markedOptions);

  if (options && options.trimHTML) {
    return trimHTML(html);
  }

  return html;
};

module.exports = Renderer;