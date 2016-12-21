module.exports = function emit(serializer, renderedCorpus, callback) {
  serializer.emitCorpusDocuments(renderedCorpus, callback);
};