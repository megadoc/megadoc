module.exports = function emit(serializer, withRenderedTrees, callback) {
  serializer.emitCorpusDocuments(withRenderedTrees, function(err) {
    if (err) {
      callback(err);
    }
    else {
      callback(null, withRenderedTrees);
    }
  });
};