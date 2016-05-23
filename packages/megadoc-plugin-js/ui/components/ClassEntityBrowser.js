const React = require("react");
const Link = require('components/Link');
const orderAwareSort = require('../utils/orderAwareSort');
const classSet = require('classnames');
const { object, bool, } = React.PropTypes;

var ClassEntityBrowser = React.createClass({
  propTypes: {
    standalone: bool,
    documentNode: object,
    documentEntityNode: object,
  },

  render() {
    const { documentNode } = this.props;

    if (!documentNode.entities || !documentNode.entities.length) {
      return null;
    }

    const entityDocuments = orderAwareSort.asNodes(documentNode, documentNode.entities, 'id');

    return (
      <ul
        className={
          classSet("class-browser__methods", {
            'class-browser__methods--standalone': this.props.standalone
          })
      }>
        {entityDocuments.map(this.renderEntity)}
      </ul>
    );
  },

  renderEntity(node) {
    return (
      <li key={node.uid} className="class-browser__methods-entity">
        <Link
          to={node}
          children={(node.properties.symbol || '') + node.properties.name}
          title={node.title}
        />
      </li>
    );
  },
});

module.exports = ClassEntityBrowser;