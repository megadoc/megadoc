var Corpus = require('megadoc-corpus').Corpus;
var b = require('megadoc-corpus').Types.builders;
var strHumanize = require('./utils/strHumanize');

module.exports = reduce;

function reduce(compiler, config, documents) {
  var nodes;

  if (config.withFolders) {
    var folderConfigs = config.folders || [];
    var folders = documents.reduce(function(map, doc) {
      if (!map[doc.folder]) {
        map[doc.folder] = reduceFolder(doc.folder);
      }

      Corpus.attachNode('documents', map[doc.folder], reduceDocument(doc))

      return map;
    }, {});

    nodes = Object.keys(folders).map(function(x) {
      return folders[x];
    });
  }
  else {
    nodes = documents.map(reduceDocument);
  }

  return b.namespace({
    id: config.id,
    name: 'megadoc-plugin-markdown',
    title: config.title,
    config: config,
    meta: {
      // TODO: stop switching against null in CorpusVisitor - it's stupid
      href: config.baseURL !== undefined ? config.baseURL : undefined,
      defaultLayouts: require('./defaultLayouts'),
    },

    documents: nodes
  });

  function reduceFolder(folderPath) {
    var folderConfig = folderConfigs.filter(function(x) {
      return x.path === folderPath;
    })[0];

    var title = folderConfig && folderConfig.title || generateFolderTitle(folderPath)

    return b.document({
      id: folderPath,
      title: title,
      meta: {
        href: null
      },
      documents: []
    });
  }

  function reduceDocument(doc) {
    // omg omg, we're rendering everything twice now
    var compiled = compiler.renderer.withTOC(doc.source);

    // TODO: b.markdownDocument
    return b.document({
      id: doc.id,
      symbol: '#',
      title: doc.plainTitle,
      summary: doc.summary,
      filePath: doc.filePath,
      properties: doc,
      entities: compiled.toc.map(function(section) {
        return b.documentEntity({
          id: section.scopedId,
          title: section.text,
          properties: section,
          meta: {
            indexDisplayName: Array(section.level * 2).join(' ') + section.text,
            anchor: section.scopedId
          }
        })
      })
    })
  }

  function generateFolderTitle(folderPath) {
    if (config.fullFolderTitles) {
      return folderPath
        .replace(config.commonPrefix, '')
        .split('/')
        .map(strHumanize)
        .join(config.fullFolderTitleDelimiter)
      ;
    }
    else {
      var fragments = folderPath.split('/');
      return strHumanize(fragments[fragments.length-1]);
    }
  }
}