const Parser = require('./Parser');

module.exports = function parseFn(context, filePath, done) {
  const parserConfig = Object.assign({
    strict: context.compilerOptions.strict,
    verbose: context.compilerOptions.verbose,
  }, context.options.parser);

  const rawDocuments = Parser.parseFile(filePath, parserConfig).map(function(doc) {
    return Object.assign(doc, {
      filePath
    });
  });

  done(null, rawDocuments);
};