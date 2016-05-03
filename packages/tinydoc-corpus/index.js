require('./defs/core');

var Corpus = require('./lib/Corpus');
var CorpusTypes = require('./lib/CorpusTypes');

CorpusTypes.finalize();

exports.Corpus = Corpus;
exports.Types = CorpusTypes;
exports.builders = CorpusTypes.builders;