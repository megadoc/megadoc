const React = require("react");
const { Link } = require('react-router');
const Icon = require('components/Icon');
const config = require('config');
const { BannerItem } = require('components/Banner');

const GitNavigation = React.createClass({
  render() {
    const icon = config.navigationIcon;
    const label = config.navigationLabel;

    return (
      <BannerItem>
        <Link to="git">
          {icon && <Icon className={icon} />} {label || 'Activity'}
        </Link>
      </BannerItem>
    );
  }
});

module.exports = GitNavigation;