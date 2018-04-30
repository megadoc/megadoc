const React = require("react");
const Link = require('components/Link');
const HotItemIndicator = require('components/HotItemIndicator');
const { ROOT_FOLDER_ID } = require('constants');
const ArticleTOC = require('./ArticleTOC');
const filterDocuments = require('utils/filterDocuments')
const strHumanize = require('../../lib/utils/strHumanize');
const { object } = React.PropTypes;

var Browser = React.createClass({
  propTypes: {
    namespaceNode: object,
    documentNode: object,
    documentEntityNode: object,
    expanded: React.PropTypes.bool,
    flat: React.PropTypes.bool,
    filter: React.PropTypes.array,
  },

  getInitialState() {
    return {
      groupByFolder: false
    };
  },

  render() {
    const { namespaceNode } = this.props;

    return (
      <nav className="megadoc-document-browser markdown-browser">
        <div>
          {Array.isArray(namespaceNode.config.folders) && namespaceNode.config.folders.length > 0 ? (
            FolderHierarchy(namespaceNode).map(this.renderFolder)
          ) : (
            namespaceNode.documents
              .filter(filterDocuments(this.props.filter))
              .map(this.renderArticle)
          )}
        </div>
      </nav>
    );
  },

  renderFolders(folders) {
    return (
      <div>
        {folders.map(this.renderFolder)}
      </div>
    );
  },

  renderFolder(folder) {
    const { documents } = folder;
    const filtered = documents.filter(filterDocuments(this.props.filter))
    const { config } = this.props.namespaceNode;

    if (!filtered.length) {
      return null;
    }

    const effectiveFolderTitle = folder.title === '.' ? config.rootFolderTitle : folder.title

    return (
      <div key={folder.path} className="class-browser__category">
        {effectiveFolderTitle && effectiveFolderTitle.length > 0 && (
          <h3 className="class-browser__category-name">
            {effectiveFolderTitle}
          </h3>
        )}

        <div>
          {documents.map(this.renderArticle)}
        </div>
      </div>
    );
  },

  renderArticle(documentNode) {
    const article = documentNode.properties;
    const isActive = this.props.documentNode === documentNode || this.props.expanded;
    let title = article.title || '';

    if (this.state.groupByFolder &&
      article.folder !== ROOT_FOLDER_ID &&
      article.folder !== '.') {

      if (title.indexOf(article.folder + '/') === 0) {
        title = title.substr(article.folder.length + 1 /* '/' */);
      }
    }

    return (
      <div key={documentNode.uid}>
        <Link to={documentNode} className="class-browser__entry-link">
          {article.plainTitle}

          {documentNode.meta.gitStats && (
            <HotItemIndicator timestamp={documentNode.meta.gitStats.lastCommittedAt} />
          )}
        </Link>

        {isActive && !this.props.flat && this.renderTOC(documentNode)}
      </div>
    );
  },

  renderTOC(documentNode) {
    return <ArticleTOC documentNode={documentNode} />
  },
});

function FolderHierarchy(namespaceNode) {
  const { assign, findWhere, sortBy } = require('lodash');
  const { config, documents } = namespaceNode;
  const folders = {};

  sortBy(documents, 'title').forEach(documentNode => {
    const folderPath = documentNode.properties.folder;

    if (!(folderPath in folders)) {
      folders[folderPath] = createFolderConfig(folderPath);
    }

    folders[folderPath].documents.push(documentNode);
  });

  Object.keys(folders).forEach(folderPath => {
    const folder = folders[folderPath];

    if (folder.series) {
      folder.documents = sortBy(folder.documents, 'properties.fileName');
    }

    // README always comes first
    folder.documents = sortBy(folder.documents, function(a) {
      if (a.properties.fileName === 'README') {
        return -1;
      }
      else {
        return 1;
      }
    });
  })

  // TODO: can we please do this at compile-time instead??
  //
  // no we can't, zip it
  function createFolderConfig(folderPath) {
    const folderConfig = findWhere(config.folders, { path: folderPath });
    const folder = assign({}, folderConfig, {
      path: folderPath,
      documents: []
    });

    // generate a title
    if (!folder.title) {
      if (config.fullFolderTitles) {
        folder.title = folderPath
          .replace(config.commonPrefix, '')
          .split('/')
          .map(strHumanize)
          .join(config.fullFolderTitleDelimiter)
        ;
      }
      else {
        const fragments = folderPath.split('/');
        folder.title = strHumanize(fragments[fragments.length-1]);
      }
    }

    return folder;
  }

  return sortBy(Object.keys(folders).map(x => folders[x]), 'title');
}

module.exports = Browser;