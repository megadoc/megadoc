const async = require('async');
const K = require('./constants');

module.exports = function purge({ serializer, corpusInfo }, done) {
  const { assetUtils, compilerConfig } = serializer;
  const filePaths = {}

  corpusInfo.renderedCorpus.traverse({
    Node(node) {
      if (node.meta && node.meta.htmlFilePath) {
        filePaths[node.meta.htmlFilePath] = true;
      }
    },
  });

  const removeDocumentFile = (filePath, callback) => {
    if (compilerConfig.verbose) {
      console.log('[D] Document file "%s" will be purged.', filePath);
    }

    assetUtils.removeAsset(filePath, callback);
  }

  const withConfigFile = Object.keys(filePaths).concat([
    K.CONFIG_FILE
  ]);

  async.eachSeries(withConfigFile, removeDocumentFile, done);
};
