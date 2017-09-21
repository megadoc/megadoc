const R = require('ramda');
const { Corpus } = require('megadoc-corpus');
const TreeRenderer = require('./TreeRenderer');
const LinkResolver = require('./LinkResolver');
const Renderer = require('./Renderer');
const Linter = require('megadoc-linter');

module.exports = function render({ serializer, compilations }, done) {
  const corpusInfo = aggregateTreesIntoCorpus(serializer, compilations);
  const corpus = corpusInfo.corpus;
  const rootNodes = corpusInfo.rootNodes;
  const serializerConfig = serializer.config;

  const withNodes = rootNodes.map((node, index) => {
    return { node: node, compilation: compilations[index] };
  });

  const linkResolver = new LinkResolver(corpus, {
    relativeLinks: !serializerConfig.singlePageMode,
    ignore: serializerConfig.linkResolver.ignore,
    injectors: serializerConfig.linkResolver.injectors,
    compilerConfig: serializer.compilerConfig,
  });

  const markdownRenderer = new Renderer({
    launchExternalLinksInNewTabs: serializerConfig.launchExternalLinksInNewTabs,
    shortURLs: !serializerConfig.singlePageMode,
    syntaxHighlighting: serializerConfig.syntaxHighlighting,
  });

  const state = {
    compilerConfig: serializer.compilerConfig,
    markdownRenderer,
    linkResolver: linkResolver,
    corpus: corpus,
  };

  // todo: distribute
  const renderedNodes = withNodes.map(R.partial(renderTree, [state]))
  const renderedCorpus = aggregateRenderedTreesIntoCorpus(serializer, renderedNodes);

  done(null, {
    corpus,
    renderedCorpus: renderedCorpus,
    edgeGraph: null
  });
};

function renderTree(state, compilationWithNode) {
  const node = compilationWithNode.node;
  const compilation = compilationWithNode.compilation;
  const renderOperations = compilation.renderOperations;

  return TreeRenderer.renderTree(state, node, renderOperations);
}

function aggregateTreesIntoCorpus(serializer, compilations) {
  const corpus = Corpus(serializer.compilerConfig, { linter: Linter.NullLinter });

  const rootNodes = compilations.map(function(compilation) {
    const serializerOptions = compilation.serializerOptions.html || {};

    compilation.tree.meta.defaultLayouts = serializerOptions.defaultLayouts;

    return corpus.add(compilation.tree);
  });

  corpus.traverse(serializer.corpusVisitor);

  return { corpus: corpus, rootNodes: rootNodes };
}

function aggregateRenderedTreesIntoCorpus({ compilerConfig }, trees) {
  const corpus = Corpus(compilerConfig, { linter: Linter.for(compilerConfig) });

  trees.forEach(R.unary(corpus.add));

  return corpus;
}
