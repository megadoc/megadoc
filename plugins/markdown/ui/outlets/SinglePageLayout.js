const React = require('react');
const Database = require('core/Database');
const OutletManager = require('core/OutletManager');
const AllArticles = require('../screens/AllArticles');
const ClassBrowser = require('components/ClassBrowser');

module.exports = function(routeName, config) {
  const database = Database.for(routeName);

  OutletManager.add('SinglePageLayout::ContentPanel', {
    key: `${routeName}-all-articles`,

    component: React.createClass({
      shouldComponentUpdate: function(nextProps, nextState) {
        return false;
      },

      render() {
        return (
          <AllArticles
            routeName={routeName}
          />
        );
      }
    }),
  });

  OutletManager.add('SinglePageLayout::Sidebar', {
    key: `${routeName}-class-browser`,
    component: React.createClass({
      render() {
        return (
          <div>
            <h2>{config.title}</h2>

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