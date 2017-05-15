const { Corpus } = require('megadoc-corpus');
const TreeRenderer = require('./TreeRenderer');
const LinkResolver = require('./LinkResolver');
const Renderer = require('./Renderer');

module.exports = function renderCorpus({ serializer, compilations }, done) {
  const corpusInfo = aggregateTreesIntoCorpus(serializer, compilations);
  const corpus = corpusInfo.corpus;
  const rootNodes = corpusInfo.rootNodes;
  const serializerConfig = serializer.config;

  const withNodes = rootNodes.map((node, index) => {
    return { node: node, compilation: compilations[index] };
  });

  const linkResolver = new LinkResolver(corpus, {
    relativeLinks: !serializerConfig.layoutOptions.singlePageMode,
    ignore: serializerConfig.linkResolver.ignore,
    injectors: serializerConfig.linkResolver.injectors,
  });

  const markdownRenderer = new Renderer({
    launchExternalLinksInNewTabs: serializerConfig.launchExternalLinksInNewTabs,
    shortURLs: !serializerConfig.layoutOptions.singlePageMode,
    syntaxHighlighting: serializerConfig.syntaxHighlighting,
  });

  const state = {
    compilerConfig: serializer.compilerConfig,
    markdownRenderer,
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
