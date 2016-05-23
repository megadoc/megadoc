var _ = require('lodash');
var RendererUtils = require('./RendererUtils');
var multiline = require('multiline-slash');

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

function renderHeading(text, level, state, runOptions) {
  var scopedId = RendererUtils.normalizeHeading(
    RendererUtils.htmlToText(text.split('\n')[0])
  );

  var id = state.baseURL ? joinBySlash(state.baseURL, scopedId) : scopedId;

  if (state.toc.some(function(x) { return x.scopedId === scopedId; })) {
    scopedId = level + scopedId;
  }

  // TODO: gief a markdown analyzer, really...
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

function stripLeadingHash(x) {
  return x[0] === '#' ? x.slice(1) : x;
}

function joinBySlash(a, b) {
  var shouldDelimit = a && a[a.length-1] !== '/';

  return a + (shouldDelimit ? '/' : '') + b;
}

module.exports = renderHeading;