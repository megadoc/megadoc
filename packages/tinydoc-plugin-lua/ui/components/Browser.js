const React = require('react');
const Link = require('components/Link');
const { shape, array, string, } = React.PropTypes;

const Browser = React.createClass({
  propTypes: {
    params: shape,
    database: array,
    routeName: string,
  },

  shouldComponentUpdate: function(nextProps) {
    return nextProps.params !== this.props.params;
  },

  render() {
    const modules = this.props.database.filter(d => d.isModule);

    return (
      <ul className="lua-browser">
        {modules.map(this.renderModule)}
      </ul>
    );
  },

  renderModule(moduleDoc) {
    const { routeName } = this.props;
    const entities = this.props.database.filter(d => d.receiver === moduleDoc.id);

    return (
      <li key={moduleDoc.path} className="lua-browser__module">
        <Link
          className="lua-browser__link"
          to={`${routeName}.module`}
          params={{moduleId: encodeURIComponent(moduleDoc.id)}}
          children={moduleDoc.id}
        />

        <ol>
          {entities.map(this.renderEntity)}
        </ol>
      </li>
    );
  },

  renderEntity(doc) {
    const { routeName } = this.props;

    return (
      <li key={doc.path} className="lua-browser__module-entity">
        <Link
          className="lua-browser__link"
          to={`${routeName}.module.entity`}
          params={{
            moduleId: encodeURIComponent(doc.receiver),
            entityId: encodeURIComponent(doc.symbol + doc.id)
          }}
          children={doc.id}
        />
      </li>
    );
  }
});

module.exports = Browser;
