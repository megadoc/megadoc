const CorpusAPI = require('core/CorpusAPI');
const megadoc = {}; // ...

module.exports = function(mochaSuite, stub) {
  let originalCorpus;

  mochaSuite.beforeEach(function() {
    originalCorpus = megadoc.corpus;
    megadoc.corpus = CorpusAPI(typeof stub === 'function' ? stub() : stub);
  });

  mochaSuite.afterEach(function() {
    megadoc.corpus = originalCorpus;
  });
};