const findCommonPrefix = require('./utils/findCommonPrefix');
const { RendererUtils } = require('megadoc-html-serializer');
const path = require('path');

module.exports = function refineFn({ options: config, compilerOptions, sourcePatterns }, documents, done) {
  // console.log('[D] megadoc-plugin-markdown: Refining %d documents', documents.length);

  const commonPrefix = findCommonPrefix(
    sourcePatterns
      .concat(documents.map(x => x.filePath))
      .map(expandPath(compilerOptions.assetRoot))
  , '/');

  const withCommonRoot = documents.map(document => {
    const extName = path.extname(document.filePath);
    let id;

    if (config.discardFileExtension) {
      id = RendererUtils.normalizeHeading(
        document.filePath
          .replace(extName, '')
          .replace(commonPrefix, '')
      );
    }
    else {
      id = RendererUtils.normalizeHeading(document.filePath.replace(commonPrefix, ''));
    }

    if (config.discardIdPrefix) {
      id = id.replace(config.discardIdPrefix, '');
    }

    return Object.assign({}, document, {
      id,
      sortingId: document.filePath.replace(commonPrefix, ''),
    })
  });

  done(null, withCommonRoot);
};

function expandPath(assetRoot) {
  return function(filePath) {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    else {
      return path.resolve(assetRoot, filePath)
    }
  }
}