const Parser = require('./Parser');

module.exports = function parseFn(context, filePath, done) {
  const parserConfig = context.options.parser;
  const rawDocuments = Parser.parseFile(filePath, parserConfig).map(function(doc) {
    return Object.assign(doc, {
      filePath: filePath.replace(context.commonOptions.assetRoot, '')
    });
  });

  done(null, rawDocuments);
};