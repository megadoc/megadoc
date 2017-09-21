const { Parser } = require('jsdoc-parser-extended');
const Linter = require('megadoc-linter');

module.exports = function parseFn(context, filePath, done) {
  const parser = new Parser({
    linter: Linter.for(context.compilerOptions)
  })

  parser.parseFile(filePath, context.options.parserConfig);

  done(null, parser.toJSON());
};
