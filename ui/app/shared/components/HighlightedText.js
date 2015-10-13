const React = require('react');
const hljs = require('highlight.js/lib/highlight');
const Storage = require('core/Storage');
const { CFG_SYNTAX_HIGHLIGHTING } = require('constants');

hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));
hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'));
hljs.registerLanguage('ruby', require('highlight.js/lib/languages/ruby'));
hljs.registerLanguage('css', require('highlight.js/lib/languages/css'));
hljs.registerLanguage('scss', require('highlight.js/lib/languages/scss'));

var HighlightedText = React.createClass({
  statics: {
    isHighlightingEnabled() {
      return Storage.get(CFG_SYNTAX_HIGHLIGHTING);
    },
  },

  propTypes: {
    children: React.PropTypes.any,
    className: React.PropTypes.string,
  },

  componentDidMount: function () {
    if (HighlightedText.isHighlightingEnabled()) {
      this.highlightCode();
    }
  },

  componentDidUpdate: function () {
    if (HighlightedText.isHighlightingEnabled()) {
      this.highlightCode();
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

  render() {
    return (
      <div
        className={`highlighted-text ${this.props.className || ''}`}
        dangerouslySetInnerHTML={{__html: this.props.children}}
      />
    );
  }
});

module.exports = HighlightedText;