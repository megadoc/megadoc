const React = require('react');
const config = require('config');
const Link = require('components/Link');
const Icon = require('components/Icon');

tinydoc.use(function GitPlugin(api) {
  api.addRoutes([
    {
      name: 'git',
      path: config.routeName,
      handler: require('./screens/Root')
    }
  ]);

  tinydoc.outlets.add('MultiPageLayout::Banner', {
    key: 'git',
    component: React.createClass({
      render() {
        const icon = config.navigationIcon;
        const label = config.navigationLabel;

        return (
          <Link to="git">
            {icon && <Icon className={icon} />} {label || 'Activity'}
          </Link>
        );
      }
    })
  });
});