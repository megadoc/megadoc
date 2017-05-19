const Parser = require('jsdoc-parser-extended').Parser;

module.exports = function parseFn(context, filePath, done) {
  const parser = new Parser({})

  parser.parseFile(filePath, context.options.parserConfig);

  done(null, parser.toJSON());
};
