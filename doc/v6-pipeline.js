pipeLine: parse[...] -> reduce[...] -> reduceTree -> render[...] -> [emitAssets, emitStats]

$processors = resolve_processors

*parse($files) -> $rawDocuments:
  if all $processors have atomic parse:
    distribute:
      map $file in $files:
        reduce $file into $rawDocument by $processor in $processors:
          return $processor.parse $file
  else:
    reduce $files into $rawDocuments by $processor in $processors:
      return $processor.parseBulk $files

*reduce($rawDocuments) -> $documents:
  map $rawDocument in $rawDocuments:
    reduce $rawDocument into $document by $processor in $processors:
      return $processor.reduce $rawDocument

*reduceTree($documents) -> $tree:

*render($tree) -> $renderOps:
  map $document in $tree:
    return $processor.render $document

emitAssets() -> nil:
emitStats($documents) -> nil:

//

const config = {
  sources: [
    {
      pattern: /.js/,
      include: [],
      exclude: [],
      processor: {
        name: 'megadoc-plugin-js',
        options: {
          id: 'js',
          name: 'JavaScript API',
          // ...
        },
      },
      decorators: [
        { name: 'megadoc-plugin-git' },
        { name: 'megadoc-plugin-disqus' },
        { name: 'megadoc-plugin-reference-graph' },
      ]
    }
  ]
};

Goals:

- fast (distributed)
- watch support
- (de)hydratable

How?

- consider using a declarative approach to rendering
  - this will allow us to easily re-generate the rendered tree for watch purposes;
    no fear of state
  - how?
    - we store the reduced tree in memory
    - we store the rendering mutations in memory
      - the rendered tree is computed by applying the rendering mutations against the reduced tree
      - the rendered tree will give us edge information
        - edge information can be used to find out which documents to re-render on
          file change (for watch)
