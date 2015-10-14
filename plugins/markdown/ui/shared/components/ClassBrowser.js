const React = require("react");
const { Link } = require('react-router');
const { sortBy } = require('lodash');
const Checkbox = require('components/Checkbox');
const HotItemIndicator = require('components/HotItemIndicator');
const Storage = require('core/Storage');
const strHumanize = require('tinydoc/lib/utils/strHumanize');
const GROUP_BY_FOLDER = require('constants').CFG_CLASS_BROWSER_GROUP_BY_FOLDER;
const ROOT_FOLDER_ID = strHumanize('root');
const isItemHot = require('utils/isItemHot');
const JumperMixin = require('mixins/JumperMixin');

var MarkdownClassBrowser = React.createClass({
  mixins: [
    JumperMixin(function(props) {
      if (props.activeArticleId) {
        return this.refs[props.activeArticleId];
      }
    }, 50)
  ],

  propTypes: {
    articles: React.PropTypes.array,
    activeArticleId: React.PropTypes.string,
    folders: React.PropTypes.array,
    routeName: React.PropTypes.string,
  },

  getDefaultProps: function() {
    return {
      folders: []
    };
  },

  render() {
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
    const folders = sortBy(this.props.folders, 'title');

    return (
      <div>
        {folders.map(this.renderFolder)}
      </div>
    );
  },

  renderFolder(folder) {
    let articles = folder.articles;

    if (!folder.series) {
      articles = sortBy(articles, 'title');
    }

    // README always comes first
    articles = sortBy(articles, function(a) {
      if (a.fileName === 'README') {
        return -1;
      }
      else {
        return 1;
      }
    });

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
    const articles = sortBy(this.props.articles, 'title');

    return (
      <div>
        {articles.map(this.renderArticle)}
      </div>
    );
  },

  renderArticle(article) {
    const { id } = article;
    let { title } = article;
    const isActive = this.props.activeArticleId === id;

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
          to={`${this.props.routeName}.article`}
          params={{ articleId: encodeURIComponent(id) }}
          className="class-browser__entry-link"
        >
          {title}

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

    if (section.level > 2) {
      className += " class-browser__sections-section--indented";
    }

    return (
      <li key={sectionId} className={className}>
        <Link
          to={`${this.props.routeName}.article.section`}
          params={{
            articleId: encodeURIComponent(article.id),
            sectionId: encodeURIComponent(sectionId),
          }}
          children={section.plainTitle}
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

  hasFolders() {
    return this.props.folders.filter(function(folderId) {
      return folderId !== ROOT_FOLDER_ID && folderId !== '.';
    }).length > 0;
  }
});

module.exports = MarkdownClassBrowser;