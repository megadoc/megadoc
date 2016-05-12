var marked = require('marked');
var _ = require('lodash');
var RendererUtils = require('./RendererUtils');
var multiline = require('multiline-slash');
var assign = _.assign;

var AnchorableHeadingTmpl = _.template(
  multiline(function() {;
    // <h<%- level %> class="anchorable-heading">
    //   <a name="<%- id %>" class="anchorable-heading__anchor"></a>
    //   <a href="#<%- id %>" class="anchorable-heading__link icon icon-link"></a><span class="anchorable-heading__text"><%= text %></span>
    // </h<%- level %>>
  })
);

var HeadingTmpl = _.template(
  multiline(function() {;
    // <h<%- level %>>
    //   <%= text %>
    // </h<%- level %>>
  })
);

var RE_INTERNAL_LINK = Object.freeze(/^tiny:\/\//);

function createRenderer(config) {
  var renderer = new marked.Renderer();
  var markedOptions = Object.freeze({
    renderer: renderer,
    gfm: true,
    tables: true,
    sanitize: false,
    breaks: false,
    linkify: false,
    pedantic: false,
  });

  var state;
  var runOptions;

  function createState(baseURL) {
    return { baseURL: baseURL || '', toc: [] };
  }

  function createRunOptions(options) {
    options = options || {};

    return { anchorableHeadings: options.anchorableHeadings !== false };
  }

  // this could be heavily optimized, but meh for now
  renderer.heading = function(text, level) {
    var scopedId = RendererUtils.normalizeHeading(
      RendererUtils.htmlToText(text.split('\n')[0])
    );

    var id = joinBySlash(state.baseURL, scopedId)

    state.toc.push({
      id: id,
      scopedId: scopedId,
      level: level,
      html: text,
      text: RendererUtils.markdownToText(text).trim()
    });

    if (runOptions.anchorableHeadings && id && id.length) {
      return AnchorableHeadingTmpl({
        // we need to strip any leading # because in SinglePageMode all baseURL
        // values will have that
        id: stripLeadingHash(id),
        level: level,
        text: text,
      });
    }
    else {
      return HeadingTmpl({ level: level, text: text });
    }
  };

  renderer.link = function(srcHref, title, text) {
    var href = srcHref.replace(RE_INTERNAL_LINK, '');
    var tagString = '<a href="' + href + '"';

    if (title) {
      tagString += ' title="' + _.escape(title) + '"';
    }

    if (href === srcHref && href[0] !== '#' && config.launchExternalLinksInNewTabs) {
      tagString += ' target="_blank"';
    }

    return tagString + '>' + text + '</a>';
  };

  var exports = function renderMarkdown(text, options) {
    var html;

    options = options || {};
    state = createState(options.baseURL);
    runOptions = createRunOptions(options);

    html = marked(text, assign({}, markedOptions, {
      sanitize: options.sanitize !== false
    }));

    if (options && options.trimHTML) {
      html = RendererUtils.trimHTML(html);
    }

    state.baseURL = '';
    runOptions = createRunOptions();

    return html;
  };

  exports.withTOC = function(text, options) {
    var html, toc;

    options = options || {};
    state = createState(options.baseURL);
    runOptions = createRunOptions(options);

    html = marked(text, assign({}, markedOptions, {
      sanitize: options.sanitize !== false
    }));

    toc = state.toc;

    if (options && options.trimHTML) {
      html = RendererUtils.trimHTML(html);
    }

    state = createState();
    runOptions = createRunOptions();

    return { html: html, toc: toc };
  };

  return exports;
}

module.exports = createRenderer;

function stripLeadingHash(x) {
  return x[0] === '#' ? x.slice(1) : x;
}

function joinBySlash(a, b) {
  var shouldDelimit = a && a[a.length-1] !== '/';

  return a + (shouldDelimit ? '/' : '') + b;
}