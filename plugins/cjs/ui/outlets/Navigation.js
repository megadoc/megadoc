const React = require('react');
const Link = require('components/Link');
const Icon = require('components/Icon');
const { BannerItem } = require('components/Banner');

module.exports = function createNavigationOutlet(config) {
  const { routeName, navigationLabel, icon } = config;

  return React.createClass({
    displayName: 'CJSNavigation',

    render() {
      return (
        <BannerItem>
          <Link to={routeName}>
            {icon && <Icon className={icon} />} {navigationLabel}
          </Link>
        </BannerItem>
      );
    }
  });
};