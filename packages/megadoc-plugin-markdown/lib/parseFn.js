const fs = require('fs');
const path = require('path');

const { analyzeDocument, generateAnchor } = require('megadoc-markdown-utils');
const strHumanize = require('./utils/strHumanize');

module.exports = function parseFn(context, absoluteFilePath, done) {
  const config = context.options;
  const relativeFilePath = absoluteFilePath.replace(context.compilerOptions.assetRoot + '/','')
  const entry = {
    filePath: absoluteFilePath,
    source: fs.readFileSync(absoluteFilePath, 'utf-8')
  };

  const extName = path.extname(relativeFilePath);
  const fileName = path.basename(relativeFilePath)
    .replace(extName, '')
    .replace(/\W/g, '-')
  ;

  const stats = analyzeDocument(entry.source)

  entry.title = getPredefinedTitle(config, relativeFilePath) || stats.title;
  entry.wordCount = stats.wordCount;

  const preformatEntry = getPreformatEntry(config, relativeFilePath);

  if (preformatEntry) {
    const { language = 'bash' } = preformatEntry;
    entry.source = '```' + language + '\n' + entry.source + '\n```\n';
  }

  if (!entry.title && !preformatEntry && config.generateMissingHeadings) {
    entry.title = strHumanize(fileName);
    entry.source = '# ' + entry.title + '\n\n' + entry.source;
  }
  else if (!entry.title) {
    entry.title = path.basename(relativeFilePath);
  }

  entry.fileName = fileName;
  entry.folder = path.dirname(relativeFilePath);
  entry.anchor = generateAnchor(entry.source);
  entry.headings = stats.headings
  entry.summary = stats.summary

  done(null, [ entry ]);
};

function getPredefinedTitle(config, filePath) {
  return config.titleOverrides && config.titleOverrides[filePath]
}

function getPreformatEntry(config, filePath) {
  return config.preformat && config.preformat[filePath] || (
    Object.keys(config.preformat).filter(key => {
      return filePath.match(key);
    }).map(key => {
      return config.preformat[key]
    })[0]
  )
}