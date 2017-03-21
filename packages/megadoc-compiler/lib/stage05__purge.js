module.exports = function purge(serializer, renderedCorpus, callback) {
  serializer.purgeEmittedCorpusDocuments(renderedCorpus, callback);
};