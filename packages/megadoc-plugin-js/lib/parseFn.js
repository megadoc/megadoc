const Parser = require('jsdoc-parser-extended').Parser;

module.exports = function parseFn(context, filePath, done) {
  const parserConfig = context.state.parserConfig;
  const emitter = context.state.emitter;
  const parser = new Parser({ emitter: emitter })

  parser.parseFile(filePath, parserConfig, context.commonOptions.assetRoot);

  done(null, parser.toJSON());
};
