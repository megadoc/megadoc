const React = require("react");
const { Link } = require('react-router');
const config = require('config');
const Icon = require('components/Icon');
const { BannerItem } = require('components/Banner');

const Navigation = React.createClass({
  render() {
    return (
      <BannerItem>
        <Link to="yard-api">
          {config.icon && <Icon className={config.icon} />} {config.navigationLabel || 'API'}
        </Link>
      </BannerItem>
    );
  }
});

module.exports = Navigation;