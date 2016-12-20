## Compilation

### Phase 1

A source file is consumed and three distinct entities are emitted: the raw 
document, the corpus document, and a rendering descriptor.

    parse*: (File) -> Object
    reduce*: (Object) -> Document
    render*: (Document) -> RenderingDescriptor

### Phase 2

The documents emitted in phase 1 are passed on to the implemenation to 
generate the tree descriptor.

    reduceTree*: (Array.<Document>) -> DocumentTreeDescriptor

### Phase 3

The documents emitted in phase 1 along with the tree descriptor emitted in 
phase 2 are used to compute the _tree_.

    composeTree: (Array.<Document>, DocumentTreeDescriptor) -> DocumentTree

### Phase 4

The trees emitted in phase 3 are aggregated into the corpus.

    buildCorpus: (Array.<DocumentTree>) -> Corpus

### Phase 5

The rendering descriptors emitted in phase 1 are applied to the corpus emitted 
in phase 4 to generate a corpus of rendered documents alongside an edge graph.

Edge graph describes the *observed* relationships between documents.

    renderCorpus: (Corpus, Array.<RenderingDescriptor>) -> RenderedCorpus

### Phase 6

An .html file is emitted for each document in the corpus, along with the 
assets needed at run-time.

    emitDocumentFiles: (Corpus) -> void
    emitAssets: (void) -> void

### Corpus Visitors

- must be pure
- may be cached by the compiler implementation