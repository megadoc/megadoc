var React = require('react');
var { Link } = require('react-router');
var Icon = require('components/Icon');

var Navigation = React.createClass({
  getKey() {
    return this.props.name;
  },

  render() {
    return this.renderCollectionLink(this.props);
  },

  renderCollectionLink(collection) {
    if (collection.navigationEntry === false) {
      return null;
    }

    return (
      <Link key={collection.name} to={collection.name}>
        {collection.icon && [
          <Icon key="icon" className={collection.icon} />,
          ' '
        ]}

        {collection.title}
      </Link>
    );
  }
});

module.exports = Navigation;