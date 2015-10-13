const React = require("react");
// const marked = require('marked');
const LinkResolver = require('core/LinkResolver');
const { getQueryItem } = require('core/Router');
const scrollIntoView = require('utils/scrollIntoView');
const Utils = require('./MarkdownText/Utils');
// const Renderer = require('./MarkdownText/Renderer');

// const markedOptions = Object.freeze({
//   renderer: new Renderer(),
//   sanitize: true,
//   breaks: false,
// });

var MarkdownText = React.createClass({
  statics: {
    normalizeHeading: Utils.normalizeHeading,
    renderText: Utils.renderText,

    // renderMarkdown(md) {
    //   return marked(md, markedOptions);
    // }
  },

  propTypes: {
    // jumpy: React.PropTypes.bool,
    children: React.PropTypes.any,
    className: React.PropTypes.string,
  },

  // getDefaultProps: function() {
  //   return {
  //     jumpy: false
  //   };
  // },

  // componentDidMount: function () {
  //   if (this.props.jumpy) {
  //     this.jumpIfNeeded();
  //   }
  // },

  // componentDidUpdate: function () {
  //   if (this.props.jumpy) {
  //     this.jumpIfNeeded();
  //   }
  // },

  // jumpIfNeeded() {
  //   var section = getQueryItem('section');
  //   var node;

  //   if (section && section.length) {
  //     node = this.getDOMNode().querySelector(`[id="${section}"]`);

  //     if (node) {
  //       if (typeof node.scrollIntoViewIfNeeded === 'function') {
  //         node.scrollIntoViewIfNeeded();
  //       }
  //       else {
  //         scrollIntoView(node);
  //       }
  //     }
  //     else {
  //       console.warn('Unable to jump to section ' + section + '; element not found.');
  //     }
  //   }
  // },

  render() {
    return (
      <div
        className={`markdown-text ${this.props.className || ''}`}
        dangerouslySetInnerHTML={{
          __html: this.props.children
        }}
      />
    );
  }
});

module.exports = MarkdownText;