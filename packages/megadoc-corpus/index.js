require('./defs/core');

exports.Corpus = require('./lib/Corpus');
exports.Types = require('./lib/CorpusTypes');
exports.builders = require('./lib/CorpusTypes').builders;
exports.dumpNodeFilePath = require('./lib/Corpus').dumpNodeFilePath;
exports.assignUID = require('./lib/assignUID');