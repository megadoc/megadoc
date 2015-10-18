const React = require('react');
const hljs = require('highlight.js/lib/highlight');
const Storage = require('core/Storage');
const { CFG_SYNTAX_HIGHLIGHTING } = require('constants');

hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
// hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml'));
hljs.registerLanguage('bash', require('highlight.js/lib/languages/bash'));
hljs.registerLanguage('ruby', require('highlight.js/lib/languages/ruby'));
hljs.registerLanguage('css', require('highlight.js/lib/languages/css'));
hljs.registerLanguage('scss', require('highlight.js/lib/languages/scss'));

const { any, string, bool } = React.PropTypes;

const HighlightedText = React.createClass({
  statics: {
    isHighlightingEnabled() {
      return Storage.get(CFG_SYNTAX_HIGHLIGHTING);
    },
  },

  propTypes: {
    children: any,
    className: string,
    unsafe: bool,
  },

  componentDidMount: function () {
    this.highlightCode();
  },

  componentDidUpdate: function (prevProps) {
    if (prevProps.children !== this.props.children) {
      this.highlightCode();
    }
  },

  highlightCode: function () {
    if (HighlightedText.isHighlightingEnabled()) {
      const nodes = this.getDOMNode().querySelectorAll('pre');

      if (nodes.length > 0) {
        for (let i = 0; i < nodes.length; i=i+1) {
          hljs.highlightBlock(nodes[i]);
        }
      }
    }
  },

  render() {
    if (this.props.unsafe) {
      return (
        <div
          className={`highlighted-text ${this.props.className || ''}`}
          children={this.props.children}
        />
      );
    }

    return (
      <div
        className={`highlighted-text ${this.props.className || ''}`}
        dangerouslySetInnerHTML={{__html: this.props.children}}
      />
    );
  }
});

module.exports = HighlightedText;