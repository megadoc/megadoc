var React = require("react");
var marked = require('marked');
var hljs = require('highlight.js/lib/highlight');
var LinkResolver = require('core/LinkResolver');
var { getQueryItem } = require('actions/RouteActions');
var scrollIntoView = require('utils/scrollIntoView');
const Storage = require('core/Storage');
const config = require('config');
const { CFG_SYNTAX_HIGHLIGHTING } = require('constants');

hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'));
hljs.registerLanguage('ruby', require('highlight.js/lib/languages/ruby'));
hljs.registerLanguage('css', require('highlight.js/lib/languages/css'));
hljs.registerLanguage('scss', require('highlight.js/lib/languages/scss'));

var renderer = new marked.Renderer();
var RE_FIND_MARKUP_TAGS = /\<[^\>]+\>([^\<]+)\<[^\>]+\>/g;
var RE_FIND_ACCENTS = /[^\w]+/g;

var normalizeHeading = function(str) {
  return encodeURIComponent(
    str
      .toLowerCase()
      .replace(RE_FIND_MARKUP_TAGS, '$1')
      .replace(RE_FIND_ACCENTS, '-')
  );
};

renderer.heading = function (text, level) {
  var id = normalizeHeading(text);
  var link = location.href.replace(/[\?|\&]section=[^\&]+/, '');
  var token = link.indexOf('?') > -1 ? '&' : '?';

  link = `${link}${token}section=${id}`;

  return (`
    <h${level} class="markdown-text__heading" id="${id}">
      <span class="markdown-text__heading-title">${text}</span>
      <a name="${id}" class="markdown-text__heading-anchor icon icon-link" href="${link}"></a>
    </h${level}>
  `);
};

// When using History-based location, we need to mark internal links generated
// by the LinkResolver with "data-internal" so that we can intercept them and
// cause a transition when they're clicked, instead of causing the browser
// to refresh.
if (!config.useHashLocation) {
  const TINY_LINK_MARKER = Object.freeze(/^tiny:\/\//);

  renderer.link = function(href, title, text) {
    var a = document.createElement('a');

    a.href = href;
    a.title = title;

    let textWithoutMarker = text.replace(TINY_LINK_MARKER, '');

    if (text !== textWithoutMarker) {
      a.dataset.internal = true;
    }

    a.innerText = textWithoutMarker;

    return a.outerHTML;
  };
}

var markedOptions = {
  renderer: renderer,
  breaks: false,
  sanitize: true,
  linkify: true
};

var MarkdownText = React.createClass({
  statics: {
    normalizeHeading: normalizeHeading,

    isHighlightingEnabled() {
      return Storage.get(CFG_SYNTAX_HIGHLIGHTING);
    }
  },

  propTypes: {
    linkify: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      linkify: true,
      jumpy: false
    };
  },

  componentDidMount: function () {
    if (MarkdownText.isHighlightingEnabled()) {
      this.highlightCode();
    }

    if (this.props.jumpy) {
      this.jumpIfNeeded();
    }
  },

  componentDidUpdate: function () {
    if (MarkdownText.isHighlightingEnabled()) {
      this.highlightCode();
    }

    if (this.props.jumpy) {
      this.jumpIfNeeded();
    }
  },

  highlightCode: function () {
    var nodes = this.getDOMNode().querySelectorAll('pre');

    if (nodes.length > 0) {
      for (var i = 0; i < nodes.length; i=i+1) {
        hljs.highlightBlock(nodes[i]);
      }
    }
  },

  jumpIfNeeded() {
    var section = getQueryItem('section');
    var node;

    if (section && section.length) {
      node = this.getDOMNode().querySelector(`#${section}`);

      if (node) {
        scrollIntoView(node);
      }
      else {
        console.warn('Unable to jump to section ' + section + '; element not found.');
      }
    }
  },

  render() {
    var text = this.props.children;

    if (this.props.linkify) {
      text = LinkResolver.linkify(text);
    }

    return (
      <div
        className={`markdown-text ${this.props.className || ''}`}
        dangerouslySetInnerHTML={{
          __html: marked(text, markedOptions)
        }}
      />
    );
  }
});

module.exports = MarkdownText;