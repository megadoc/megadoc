Array[File] | parse();
Tuple[ChangeManifest, PreviousCompilation] | merge();

// parse documents from source files
parse = (Array[File]): Array[Document];
parse | merge();

// merge newly-parsed documents with documents from any previous compilation
merge(ChangeManifest, PreviousCompilation): (Array[Document]): Array[Document];
merge | refine();

// apply any necessary treatment to the set of parsed documents as a whole
refine = (Array[Document]): Array[Document];
refine | reduce();

// reduce the set of parsed documents into IR nodes
reduce = (Array[Document]): Array[Node]
reduce | render()
reduce | reduceTree()

// collect the set of rendering operations to apply on node data points
render = (Array[Node]): Map[RenderingDescriptor];
render | renderCorpus();

// collect info about the relationships between nodes
reduceTree = (Array[Node]): Array[NodeTreeDescriptor];
reduceTree | composeTree()

// build a graph representing the relationships between nodes
composeTree = (Array[NodeTreeDescriptor]): Array[NodeTree];
composeTree | buildCorpus()

buildCorpus = (Array[NodeTree]): Corpus;
buildCorpus | renderCorpus();

renderCorpus = (Corpus): Corpus;
renderCorpus | emit();

emit = (Corpus): Array[HTMLFile];

