const { Corpus } = require('megadoc-corpus');
const TreeRenderer = require('./TreeRenderer');
const LinkResolver = require('./LinkResolver');

module.exports = function renderCorpus({ serializer, compilations }, done) {
  const corpusInfo = aggregateTreesIntoCorpus(serializer, compilations);
  const corpus = corpusInfo.corpus;
  const rootNodes = corpusInfo.rootNodes;

  const withNodes = rootNodes.map((node, index) => {
    return { node: node, compilation: compilations[index] };
  });

  const linkResolver = new LinkResolver(corpus, {
    relativeLinks: !serializer.config.layoutOptions.singlePageMode,
    ignore: serializer.config.linkResolver.ignore,
    injectors: serializer.config.linkResolver.injectors,
  });

  const state = {
    commonOptions: serializer.compilerConfig,
    markdownRenderer: serializer.markdownRenderer,
    linkResolver: linkResolver,
    corpus: corpus,
  };

  // todo: distribute
  const renderedNodes = withNodes.map(renderTree)
  const renderedCorpus = aggregateRenderedTreesIntoCorpus(serializer, renderedNodes);

  done(null, {
    corpus,
    renderedCorpus: renderedCorpus,
    edgeGraph: null
  });

  function renderTree(compilationWithNode) {
    const node = compilationWithNode.node;
    const compilation = compilationWithNode.compilation;
    const renderOperations = compilation.renderOperations;

    return TreeRenderer.renderTree(state, node, renderOperations);
  }
};

function aggregateTreesIntoCorpus(serializer, compilations) {
  const corpus = Corpus({
    strict: serializer.compilerConfig.strict,
    debug: serializer.compilerConfig.debug
  });

  corpus.visit(serializer.corpusVisitor);

  const rootNodes = compilations.map(function(compilation) {
    const serializerOptions = compilation.processor.serializerOptions.html || {};

    compilation.tree.meta.defaultLayouts = serializerOptions.defaultLayouts;

    return corpus.add(compilation.tree);
  });

  return { corpus: corpus, rootNodes: rootNodes };
}

function aggregateRenderedTreesIntoCorpus(serializer, trees) {
  const corpus = Corpus({
    strict: serializer.compilerConfig.strict,
    debug: serializer.compilerConfig.debug
  });

  trees.forEach(function(tree) {
    corpus.add(tree);
  });

  return corpus;
}
