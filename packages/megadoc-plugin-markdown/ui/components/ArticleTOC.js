const React = require("react");
const Link = require('components/Link');
const classSet = require('utils/classSet');

const ArticleTOC = React.createClass({
  propTypes: {
    documentNode: React.PropTypes.object,
    documentEntityNode: React.PropTypes.object,
    flat: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      flat: false
    };
  },

  render() {
    return (
      <ul
        className={classSet("markdown-toc", {
          "markdown-toc--flat": this.props.flat
        })}
      >
        {this.props.documentNode.entities.map(this.renderSection)}
      </ul>
    );
  },

  renderSection(documentEntityNode) {
    const section = documentEntityNode.properties;

    if (section.level === 1) {
      return null;
    }

    let className = "class-browser__sections-section";

    if (section.level > 2) {
      className += " class-browser__sections-section--indented";
    }

    return (
      <li key={documentEntityNode.uid} className={className}>
        <Link to={documentEntityNode} children={section.text} />
      </li>
    );
  }
});

module.exports = ArticleTOC;