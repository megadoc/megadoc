require('./defs/core');

var Corpus = require('./lib/Corpus');
var CorpusTypes = require('./lib/CorpusTypes');

CorpusTypes.finalize();

module.exports = Corpus;