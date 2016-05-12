const CorpusAPI = require('core/CorpusAPI');

module.exports = function(mochaSuite, stub) {
  let originalCorpus;

  mochaSuite.beforeEach(function() {
    originalCorpus = tinydoc.corpus;
    tinydoc.corpus = CorpusAPI(typeof stub === 'function' ? stub() : stub);
  });

  mochaSuite.afterEach(function() {
    tinydoc.corpus = originalCorpus;
  });
};