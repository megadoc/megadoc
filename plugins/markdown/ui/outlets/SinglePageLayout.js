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
      render() {
        return (
          <AllArticles
            activeArticleId={this.props.params.splat}
            query={this.props.query}
            articles={database.getArticles()}
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
          <ClassBrowser
            routeName={routeName}
            articles={database.getArticles()}
            folders={database.getFolders()}
            activeArticleId={this.props.params.splat}
            expanded={config.sidebarExpanded}
          />
        );
      }
    }),
  });
};