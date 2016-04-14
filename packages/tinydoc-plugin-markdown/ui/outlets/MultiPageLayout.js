const React = require('react');
const Link = require('components/Link');
const Icon = require('components/Icon');
const RouteHandler = require('components/RouteHandler');
const ClassBrowser = require('../components/ClassBrowser');
const { shape, string } = React.PropTypes;

module.exports = function(api, config) {
  api.outlets.add('MultiPageLayout::Content', {
    key: config.routeName,
    match(props) { return props.path.match(`^/${config.routeName}`); },

    component: React.createClass({
      render() {
        return (
          <RouteHandler config={config} routeName={config.routeName} />
        );
      }
    })
  });

  api.outlets.add('MultiPageLayout::Sidebar', {
    key: config.routeName,
    match(props) { return props.path.match(`^/${config.routeName}`); },

    component: React.createClass({
      propTypes: {
        params: shape({
          articleId: string,
        }),
      },

      render() {
        return (
          <ClassBrowser
            routeName={config.routeName}
            activeArticleId={decodeURIComponent(this.props.params.articleId)}
          />
        );
      }
    })
  });

  if (config.title) {
    api.outlets.add('MultiPageLayout::Banner', {
      key: config.routeName,

      component: React.createClass({
        render() {
          return (
            <Link to={config.routeName}>
              {config.icon && [
                <Icon key="icon" className={config.icon} />,
                ' '
              ]}

              {config.title}
            </Link>
          );
        }
      })
    });
  }
};