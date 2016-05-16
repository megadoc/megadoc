const React = require("react");
const Link = require('components/Link');
const HotItemIndicator = require('components/HotItemIndicator');
const Storage = require('core/Storage');
const GROUP_BY_FOLDER = require('constants').CFG_CLASS_BROWSER_GROUP_BY_FOLDER;
const { ROOT_FOLDER_ID } = require('constants');
const isItemHot = require('utils/isItemHot');
const ArticleTOC = require('./ArticleTOC');
// const Database = require('../Database');
const { object } = React.PropTypes;

var Browser = React.createClass({
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

  render() {
    const renderer = this.props.namespaceNode.config.withFolders ?
      this.renderFolder :
      this.renderArticle
    ;

    return (
      <nav>
        <div>
          {this.props.namespaceNode.documents.map(renderer)}
        </div>
      </nav>
    );
  },

  renderFolder(documentNode) {
    const articles = documentNode.documents;

    return (
      <div key={documentNode.uid} className="class-browser__category">
        <h3 className="class-browser__category-name">
          {documentNode.title === '.' ? '/' : documentNode.title}
        </h3>

        <div>
          {articles.map(this.renderArticle)}
        </div>
      </div>
    );
  },

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

});

module.exports = Browser;