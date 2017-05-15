const async = require('async');
const K = require('./constants');

module.exports = function purge({ serializer, corpusInfo }, done) {
  const { assetUtils, compilerConfig } = serializer;

  const flatCorpus = corpusInfo.corpus.toJSON();
  const documentUIDs = Object.keys(flatCorpus);
  const filePaths = documentUIDs.reduce((map, uid) => {
    const node = flatCorpus[uid];
    const filePath = node.meta && node.meta.htmlFilePath;

    if (filePath) {
      map[filePath] = true;
    }

    return map;
  }, {});

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
