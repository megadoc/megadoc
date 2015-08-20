var React = require("react");
var { Link } = require('react-router');
var { sortBy, groupBy } = require('lodash');
var { normalizeHeading } = require('components/MarkdownText');
var Checkbox = require('components/Checkbox');
var HotItemIndicator = require('components/HotItemIndicator');
var Storage = require('core/Storage');
var strHumanize = require('tinydoc/lib/utils/strHumanize');
var GROUP_BY_FOLDER = require('constants').CFG_CLASS_BROWSER_GROUP_BY_FOLDER;
var ROOT_FOLDER_ID = strHumanize('root');
var isItemHot = require('utils/isItemHot');
var BrowserJumperMixin = require('mixins/BrowserJumperMixin');

var MarkdownClassBrowser = React.createClass({
  mixins: [
    BrowserJumperMixin(function(props) {
      if (props.activeArticleId) {
        return this.refs[props.activeArticleId];
      }
    })
  ],

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
          this.renderArticles(this.props.articles)
        }

        {this.renderControls()}
      </nav>
    );
  },

  renderGroupedEntries() {
    var folders = groupBy(this.props.articles, 'folder');

    return (
      <div>
        {
          Object.keys(folders).sort().map((folderId) => {
            var articles = folders[folderId];
            var isRoot = folderId === ROOT_FOLDER_ID;

            return (
              <div key={folderId} className="class-browser__category">
                <h3 className="class-browser__category-name">
                  {isRoot ? <em>No Folder</em> : strHumanize(folderId)}
                </h3>

                <div>
                  {this.renderArticles(articles)}
                </div>
              </div>
            );
          })
        }
      </div>
    );
  },

  renderArticles(articles) {
    return sortBy(articles, 'title').map(this.renderArticle);
  },

  renderArticle(article) {
    var id = article.id;
    var isActive = this.props.activeArticleId === article.id;
    var title = article.title;

    if (Storage.get(GROUP_BY_FOLDER) && article.folder !== ROOT_FOLDER_ID) {
      if (title.indexOf(article.folder+'/') === 0) {
        title = title.substr(article.folder.length + 1 /* '/' */);
      }
    }

    return (
      <div key={id} ref={id}>
        <Link
          to={`${this.props.collectionName}.article`}
          params={{ articleId: id }}
          className="class-browser__entry-link"
        >
          {title}

          {article.git && isItemHot(article.git.lastCommittedAt) && <HotItemIndicator />}
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
    var sectionId = normalizeHeading(section.title);

    if (section.level > 2) {
      className += " class-browser__sections-section--indented";
    }

    return (
      <li key={section.title} className={className}>
        <Link
          to={`${this.props.collectionName}.article`}
          params={{ articleId: encodeURIComponent(article.id) }}
          query={{ section: sectionId }}
          children={section.title}
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
      return folderId !== ROOT_FOLDER_ID;
    }).length > 0;
  }
});

module.exports = MarkdownClassBrowser;