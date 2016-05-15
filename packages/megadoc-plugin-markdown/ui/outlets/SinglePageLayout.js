const React = require('react');
const Database = require('../Database');
const AllArticles = require('../screens/AllArticles');
const ClassBrowser = require('../components/ClassBrowser');
const { shape, string } = React.PropTypes;

module.exports = function(api, config) {
  const { routeName } = config;
  const database = Database.for(routeName);

  api.outlets.add('SinglePageLayout::ContentPanel', {
    key: `${routeName}-all-articles`,

    component: React.createClass({
      shouldComponentUpdate: function() {
        return false;
      },

      render() {
        return (
          <AllArticles routeName={routeName} />
        );
      }
    }),
  });

  api.outlets.add('SinglePageLayout::Sidebar', {
    key: `${routeName}-class-browser`,
    component: React.createClass({
      propTypes: {
        params: shape({
          articleId: string,
        })
      },

      render() {
        return (
          <div>
            {config.title && (
              <header className="single-page-layout__sidebar-header">
                {config.title}
              </header>
            )}

            <ClassBrowser
              routeName={routeName}
              articles={database.getArticles()}
              folders={database.getFolders()}
              activeArticleId={decodeURIComponent(this.props.params.articleId)}
              expanded={config.sidebarExpanded}
            />
          </div>
        );
      }
    }),
  });
};