var fs = require('fs');
var path = require('path');
var marked = require('marked');
var _ = require('lodash');
var React = require('react');
var Utils = require('./Renderer/Utils');

var HeaderTmpl = _.template(
  fs.readFileSync(path.resolve(__dirname, 'Renderer', 'header.tmpl.html'), 'utf-8')
);

var RE_INTERNAL_LINK = Object.freeze(/^tiny:\/\//);

function createRenderer(config) {
  var renderer = new marked.Renderer();
  var markedOptions = Object.freeze({
    renderer: renderer,
    gfm: true,
    tables: true,
    sanitize: true,
    breaks: false,
    linkify: false,
    pedantic: false,
  });

  var state;

  function createState(baseURL) {
    return { baseURL: baseURL || '', toc: [] };
  }

  // this could be heavily optimized, but meh for now
  renderer.heading = function(text, level) {
    var id = state.baseURL;
    var scopedId = Utils.normalizeHeading(Utils.sanitize(text.split('\n')[0]));

    if (level > 1) {
      id += '/' + scopedId;
    }

    state.toc.push({
      id: id,
      scopedId: scopedId,
      level: level,
      html: text,
      text: Utils.renderText(text).trim()
    });

    return HeaderTmpl({
      id: id,
      level: level,
      text: text,
      href: '#'+id
    });
  };

  renderer.link = function(href, title, text) {
    var props = {};

    props.href = href.replace(RE_INTERNAL_LINK, '');

    if (title) {
      props.title = title;
    }

    if (props.href === href && config.launchExternalLinksInNewTabs) {
      props.target = '_blank';
    }

    props.children = _.unescape(text);

    return React.renderToStaticMarkup(React.createElement('a', props))
  };

  var exports = function renderMarkdown(text, options) {
    var html;

    options = options || {};
    state = createState(options.baseURL);

    html = marked(text, markedOptions);

    if (options && options.trimHTML) {
      html = Utils.trimHTML(html);
    }

    state.baseURL = '';

    return html;
  };

  exports.withTOC = function(text, options) {
    var html, toc;

    options = options || {};
    state = createState(options.baseURL);

    html = marked(text, markedOptions);
    toc = state.toc;

    if (options && options.trimHTML) {
      html = Utils.trimHTML(html);
    }

    state = createState();

    return { html: html, toc: toc };
  };

  return exports;
}

module.exports = createRenderer;