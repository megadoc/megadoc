const React = require("react");
const Link = require('components/Link');
const Checkbox = require('components/Checkbox');
const HotItemIndicator = require('components/HotItemIndicator');
const Storage = require('core/Storage');
const GROUP_BY_FOLDER = require('constants').CFG_CLASS_BROWSER_GROUP_BY_FOLDER;
const { ROOT_FOLDER_ID } = require('constants');
const isItemHot = require('utils/isItemHot');
const JumperMixin = require('mixins/JumperMixin');
const Database = require('../Database');

var MarkdownClassBrowser = React.createClass({
  mixins: [
    JumperMixin(function(props) {
      if (props.activeArticleId) {
        return this.refs[props.activeArticleId];
      }
      else {
        return false;
      }
    }, -50)
  ],

  propTypes: {
    activeArticleId: React.PropTypes.string,
    routeName: React.PropTypes.string,
    expanded: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      folders: []
    };
  },

  render() {
    return null;

    return (
      <nav>
        {this.hasFolders() && Storage.get(GROUP_BY_FOLDER) ?
          this.renderGroupedEntries() :
          this.renderAllArticles()
        }

        {this.renderControls()}
      </nav>
    );
  },

  renderGroupedEntries() {
    const folders = this.getFolders();

    return (
      <div>
        {folders.map(this.renderFolder)}
      </div>
    );
  },

  renderFolder(folder) {
    let articles = folder.articles;

    return (
      <div key={folder.path} className="class-browser__category">
        <h3 className="class-browser__category-name">
          {folder.title === '.' ? '/' : folder.title}
        </h3>

        <div>
          {articles.map(this.renderArticle)}
        </div>
      </div>
    );
  },

  renderAllArticles() {
    const articles = this.getArticles();

    return (
      <div>
        {articles.map(this.renderArticle)}
      </div>
    );
  },

  renderArticle(article) {
    const { id } = article;
    let { title } = article;
    const isActive = this.props.activeArticleId === id || this.props.expanded;

    if (Storage.get(GROUP_BY_FOLDER) &&
      article.folderTitle !== ROOT_FOLDER_ID &&
      article.folderTitle !== '.') {
      if (title.indexOf(article.folderTitle + '/') === 0) {
        title = title.substr(article.folderTitle.length + 1 /* '/' */);
      }
    }

    return (
      <div key={id} ref={id}>
        <Link
          to={article}
          className="class-browser__entry-link"
        >
          {article.plainTitle}

          {article.git && isItemHot(article.git.lastCommittedAt) && (
            <HotItemIndicator />
          )}
        </Link>

        {isActive && this.renderTOC(article)}
      </div>
    );
  },

  renderTOC(article) {
    return (
      <ul className="class-browser__sections">
        {article.sections.map(this.renderSection.bind(null, article))}
      </ul>
    );
  },

  renderSection(article, section) {
    var className = "class-browser__sections-section";
    var sectionId = section.id;

    if (section.level === 1) {
      return null;
    }

    else if (section.level > 2) {
      className += " class-browser__sections-section--indented";
    }

    return (
      <li key={sectionId} className={className}>
        <Link
          to={section}
          children={section.text}
        />
      </li>
    );
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