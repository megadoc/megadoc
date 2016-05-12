const React = require('react');
const Link = require('components/Link');
const { shape, array, string, object, } = React.PropTypes;

const Browser = React.createClass({
  propTypes: {
    params: shape,
    namespaceNode: object,
    // database: array,
    // routeName: string,
  },

  // shouldComponentUpdate: function(nextProps) {
  //   return nextProps.params !== this.props.params;
  // },

  render() {
    return (
      <ul className="lua-browser">
        {this.props.namespaceNode.documents.map(this.renderModule)}
      </ul>
    );
  },

  renderModule(documentNode) {
    const moduleDoc = documentNode.properties;
    const { entities } = documentNode;

    return (
      <li key={documentNode.uid} className="lua-browser__module">
        <Link
          className="lua-browser__link"
          to={documentNode.meta.href}
          anchor={documentNode.meta.anchor}
          children={documentNode.title}
        />

        {entities.length > 0 && (
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
          to={documentNode.meta.href}
          children={documentNode.title}
        />
      </li>
    );
  }
});

module.exports = Browser;
