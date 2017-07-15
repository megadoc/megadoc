const React = require('react');
const Link = require('components/Link');
const { sortBy } = require('lodash');
const { object, } = React.PropTypes;

const Browser = React.createClass({
  propTypes: {
    params: object,
    namespaceNode: object.isRequired,
    documentNode: object,
  },

  render() {
    return (
      <ul className="lua-browser">
        {sortBy(this.props.namespaceNode.documents, 'title').map(this.renderModule)}
      </ul>
    );
  },

  renderModule(documentNode) {
    const { entities } = documentNode;
    const active = this.props.documentNode === documentNode;

    return (
      <li key={documentNode.uid} className="lua-browser__module">
        <Link
          className="lua-browser__link"
          to={documentNode}
          children={documentNode.title}
        />

        {active && entities.length > 0 && (
          <ol>
            {entities.map(this.renderEntity)}
          </ol>
        )}
      </li>
    );
  },

  renderEntity(documentNode) {
    return (
      <li key={documentNode.uid} className="lua-browser__module-entity">
        <Link
          className="lua-browser__link"
          to={documentNode}
          children={documentNode.title}
        />
      </li>
    );
  }
});

module.exports = Browser;
