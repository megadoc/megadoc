const React = require('react');
const { Link } = require('react-router');
const Icon = require('components/Icon');

module.exports = function createNavigationOutlet(config) {
  const Navigation = React.createClass({
    statics: {
      key: config.name
    },

    render() {
      if (config.navigationEntry === false) {
        return null;
      }

      return (
        <Link to={config.name}>
          {config.icon && [
            <Icon key="icon" className={config.icon} />,
            ' '
          ]}

          {config.title}
        </Link>
      );
    }
  });

  return Navigation;
};