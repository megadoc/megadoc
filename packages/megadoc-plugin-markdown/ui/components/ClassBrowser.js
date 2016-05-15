const React = require("react");
const Link = require('components/Link');
const Checkbox = require('components/Checkbox');
const HotItemIndicator = require('components/HotItemIndicator');
const Storage = require('core/Storage');
const GROUP_BY_FOLDER = require('constants').CFG_CLASS_BROWSER_GROUP_BY_FOLDER;
const { ROOT_FOLDER_ID } = require('constants');
const isItemHot = require('utils/isItemHot');
const JumperMixin = require('mixins/JumperMixin');
const ArticleTOC = require('./ArticleTOC');
// const Database = require('../Database');
const { object } = React.PropTypes;

var MarkdownClassBrowser = React.createClass({
  // mixins: [
  //   JumperMixin(function(props) {
  //     if (props.activeArticleId) {
  //       return this.refs[props.activeArticleId];
  //     }
  //     else {
  //       return false;
  //     }
  //   }, -50)
  // ],

  propTypes: {
    namespaceNode: object,
    documentNode: object,
    documentEntityNode: object,
    // activeArticleId: React.PropTypes.string,
    // routeName: React.PropTypes.string,
    expanded: React.PropTypes.bool,
  },

  // getDefaultProps() {
  //   return {
  //     folders: []
  //   };
  // },

  render() {
    // {this.hasFolders() && Storage.get(GROUP_BY_FOLDER) ?
    //   this.renderGroupedEntries() :
    //   this.renderAllArticles()
    // }

    return (
      <nav>
        <div>
          {this.props.namespaceNode.documents.map(this.renderArticle)}
        </div>

        {false && this.renderControls()}
      </nav>
    );
  },

  // renderGroupedEntries() {
  //   const folders = this.getFolders();

  //   return (
  //     <div>
  //       {folders.map(this.renderFolder)}
  //     </div>
  //   );
  // },

  // renderFolder(folder) {
  //   let articles = folder.articles;

  //   return (
  //     <div key={folder.path} className="class-browser__category">
  //       <h3 className="class-browser__category-name">
  //         {folder.title === '.' ? '/' : folder.title}
  //       </h3>

  //       <div>
  //         {articles.map(this.renderArticle)}
  //       </div>
  //     </div>
  //   );
  // },

  // renderAllArticles() {
  //   const articles = this.getArticles();

  //   return (
  //     <div>
  //       {articles.map(this.renderArticle)}
  //     </div>
  //   );
  // },

  renderArticle(documentNode) {
    const article = documentNode.properties;
    let { title } = article;
    const isActive = this.props.documentNode === documentNode || this.props.expanded;

    if (Storage.get(GROUP_BY_FOLDER) &&
      article.folderTitle !== ROOT_FOLDER_ID &&
      article.folderTitle !== '.') {

      if (title.indexOf(article.folderTitle + '/') === 0) {
        title = title.substr(article.folderTitle.length + 1 /* '/' */);
      }
    }

    return (
      <div key={documentNode.uid}>
        <Link to={documentNode} className="class-browser__entry-link">
          {article.plainTitle}

          {documentNode.meta.gitStats && isItemHot(documentNode.meta.gitStats.lastCommittedAt) && (
            <HotItemIndicator />
          )}
        </Link>

        {isActive && this.renderTOC(documentNode)}
      </div>
    );
  },

  renderTOC(documentNode) {
    return <ArticleTOC documentNode={documentNode} />
  },

  renderControls() {
    return (
      <div className="class-browser__controls">
        {this.hasFolders() && <Checkbox
          checked={!!Storage.get(GROUP_BY_FOLDER)}
          onChange={this.toggleGroupByFolder}
          children="Group by folder"
        />}
      </div>
    );
  },

  toggleGroupByFolder() {
    Storage.set(GROUP_BY_FOLDER, !Storage.get(GROUP_BY_FOLDER));
  },

  getFolders() {
    return Database.for(this.getRouteName()).getFolders();
  },

  getArticles() {
    return Database.for(this.getRouteName()).getArticles();
  },

  hasFolders() {
    return this.getFolders().filter(function(folderId) {
      return folderId !== ROOT_FOLDER_ID && folderId !== '.';
    }).length > 0;
  },

  getRouteName() {
    return this.props.namespaceNode.id;
  }
});

module.exports = MarkdownClassBrowser;