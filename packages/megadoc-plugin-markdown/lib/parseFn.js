const fs = require('fs');
const path = require('path');

const RendererUtils = require('megadoc-html-serializer/lib/RendererUtils');
const parseTitle = require('./utils/parseTitle');
const strHumanize = require('./utils/strHumanize');

module.exports = function parseFn(context, filePath, done) {
  const config = context.options;
  const entry = {
    filePath: filePath,
    source: fs.readFileSync(filePath, 'utf-8')
  };

  const commonPrefix = context.commonOptions.assetRoot; // TODO infer
  const extName = path.extname(entry.filePath);
  const fileName = path.basename(filePath)
    .replace(extName, '')
    .replace(/\W/g, '-')
  ;

  entry.sortingId = entry.filePath.replace(commonPrefix, '');

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
  entry.folder = path.dirname(entry.filePath);

  done(null, [ entry ]);
};