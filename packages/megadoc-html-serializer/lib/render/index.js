const R = require('ramda');
const { Corpus } = require('megadoc-corpus');
const TreeRenderer = require('./TreeRenderer');
const LinkResolver = require('./LinkResolver');
const Renderer = require('./Renderer');
const Linter = require('megadoc-linter');

module.exports = function render({ serializer, compilations }, done) {
  const { corpus, rootNodes } = aggregateTreesIntoCorpus(serializer, compilations);
  const serializerConfig = serializer.config;

  const withNodes = rootNodes.map((node, index) => {
    return { node, compilation: compilations[index] };
  });

  const linkResolver = new LinkResolver(corpus, {
    ignore: serializerConfig.linkResolver.ignore,
    injectors: serializerConfig.linkResolver.injectors,
    linter: Linter.for(serializer.compilerConfig),
  });

  const markdownRenderer = new Renderer({
    launchExternalLinksInNewTabs: serializerConfig.launchExternalLinksInNewTabs,
    shortURLs: true,
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
    renderedCorpus,
    edgeGraph: null
  });
};

function renderTree(state, { node, compilation }) {
  return TreeRenderer.renderTree(state, node, compilation);
}

function aggregateTreesIntoCorpus(serializer, compilations) {
  const corpus = Corpus(serializer.compilerConfig, { linter: Linter.NullLinter });

  const rootNodes = compilations.map(function(compilation) {
    const serializerOptions = compilation.serializerOptions.html || {};

    compilation.tree.meta.defaultLayouts = serializerOptions.defaultLayouts;

    return corpus.add(compilation.tree);
  });

  corpus.traverse(serializer.corpusVisitor);

  return { corpus, rootNodes };
}

function aggregateRenderedTreesIntoCorpus({ compilerConfig }, trees) {
  const corpus = Corpus(compilerConfig, { linter: Linter.for(compilerConfig) });

  trees.forEach(R.unary(corpus.add));

  return corpus;
}
