const React = require('react');
const Icon = require('components/Icon');
const Link = require('components/Link');

module.exports = function(config) {
  const { routeName, navigationLabel, icon } = config;

  return {
    component: React.createClass({
      displayName: `JSBannerNavigation:${routeName}`,

      render() {
        return (
          <Link to={routeName}>
            {icon && <Icon className={icon} />} {navigationLabel}
          </Link>
        );
      }
    })
  };
}