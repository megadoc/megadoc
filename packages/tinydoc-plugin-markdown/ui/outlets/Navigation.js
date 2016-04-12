const React = require('react');
const Link = require('components/Link');
const Icon = require('components/Icon');
const { BannerItem } = require('components/Banner');

module.exports = function createNavigationOutlet(config) {
  const { routeName, icon, title } = config;

  const MarkdownNavigation = React.createClass({
    render() {
      return (
        <BannerItem>
          <Link to={routeName}>
            {icon && [
              <Icon key="icon" className={icon} />,
              ' '
            ]}

            {title}
          </Link>
        </BannerItem>
      );
    }
  });

  return MarkdownNavigation;
};