const fs = require('fs');
const path = require('path');

const { RendererUtils } = require('megadoc-html-serializer');
const parseTitle = require('./utils/parseTitle');
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

  entry.title = parseTitle(entry.source);
  entry.wordCount = entry.source.split(/\s+/).length;
  entry.summary = RendererUtils.extractSummary(entry.source, {
    plainText: true
  });

  if (config.generateMissingHeadings && !entry.title) {
    entry.title = strHumanize(fileName);
    entry.source = '# ' + entry.title + '\n\n' + entry.source;
  }

  entry.plainTitle = RendererUtils.markdownToText(entry.title);
  entry.fileName = fileName;
  entry.folder = path.dirname(relativeFilePath);

  done(null, [ entry ]);
};