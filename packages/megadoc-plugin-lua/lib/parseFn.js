const Parser = require('./Parser');

module.exports = function parseFn(options, filePath, done) {
  const parserConfig = options.processor.parser;
  const rawDocuments = Parser.parseFile(filePath, parserConfig).map(function(doc) {
    return Object.assign(doc, {
      filePath: filePath.replace(options.common.assetRoot, '')
    });
  });

  done(null, rawDocuments);
};