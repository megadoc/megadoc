const React = require("react");
const marked = require('marked');
const hljs = require('highlight.js/lib/highlight');
const LinkResolver = require('core/LinkResolver');
const { getQueryItem } = require('core/Router');
const scrollIntoView = require('utils/scrollIntoView');
const Storage = require('core/Storage');
const { CFG_SYNTAX_HIGHLIGHTING } = require('constants');
const Utils = require('./MarkdownText/Utils');
const Renderer = require('./MarkdownText/Renderer');

const markedOptions = Object.freeze({
  renderer: new Renderer(),
  sanitize: true,
  breaks: false,
  linkify: false
});

hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));
hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'));
hljs.registerLanguage('ruby', require('highlight.js/lib/languages/ruby'));
hljs.registerLanguage('css', require('highlight.js/lib/languages/css'));
hljs.registerLanguage('scss', require('highlight.js/lib/languages/scss'));

var MarkdownText = React.createClass({
  statics: {
    normalizeHeading: Utils.normalizeHeading,
    renderText: Utils.renderText,

    isHighlightingEnabled() {
      return Storage.get(CFG_SYNTAX_HIGHLIGHTING);
    },
  },

  propTypes: {
    linkify: React.PropTypes.bool,
    jumpy: React.PropTypes.bool,
    children: React.PropTypes.any,
    className: React.PropTypes.string,
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

        // a hack for better JSX support
        if (nodes[i].className.match(/xml|javascript/)) {
          // nodes[i].className = 'javascript';
          // hljs.highlightBlock(nodes[i]);
          nodes[i].className = 'xml';
          hljs.highlightBlock(nodes[i]);

          nodes[i].className = 'hljs xml javascript';
        }
      }
    }
  },

  jumpIfNeeded() {
    var section = getQueryItem('section');
    var node;

    if (section && section.length) {
      node = this.getDOMNode().querySelector(`#${section}`);

      if (node) {
        if (typeof node.scrollIntoViewIfNeeded === 'function') {
          node.scrollIntoViewIfNeeded();
        }
        else {
          scrollIntoView(node);
        }
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