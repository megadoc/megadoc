# megadoc-corpus

The corpus is megadoc's module for indexing documents. The corpus has enough 
semantics to ensure a correct and intuitive approach to resolving links, among
other things like the inference of dependency and co-relation graphs between
documents and entities.

Most of megadoc's features like link-resolving, the Spotlight, and the Preview 
Tooltips rely on the corpus directly or indirectly - so as an upstream 
developer, utilizing the corpus will pay off greatly.

## Indexing

The corpus performs a depth-first search in the AST to resolve links to 
documents. The parameters for the search are the term, and the _context node_.

A lot of care has gone into making the algorithm support an _intuitive_ 
interface for linking to documents to make authoring a more pleasant 
experience. The effect we're trying to achieve is that "It Just Works". This 
is why the context node plays a great role in determining how a link is 
resolved.

### Constraints

- Document identifiers MUST NOT begin with any of the following characters:
  1. `.` (a dot)
  2. `/` (a forward slash)

### Private contextual resolving

A link could be formed using a short-hand notation when it points to an 
_entity_ within the same document (aka, a private link). The index used for
resolving such links is kept _private_ in the sense that external documents
will not be able to reference the entities using this notation.

For example, within the context of a document `X`, linking to `#someMethod` 
should resolve to `X#someMethod` if that entity exists, but linking to that 
same entity from a different document, `Y`, yields nothing.

### Resolving by (relative) filepath

Any link that begins with `./` is expected to point to a document that can be
found relative from the current document's filepath:

    [[./path/to/file]]

### Resolving by (absolute) filepath

Any link that begins with `/` is expected to point to a document that can be
found at that path, relative to the [[@assetRoot]]:

    [[/path/to/file]]

Let's look at an example corpus with the following contents:

```
- corpus
|
| - megadoc-plugin-markdown (namespace id = MD)
|   |
|   |-- X (doc/X.md)
|   |-- Y (doc/Y.md)
|   |-- Z (doc/Z.md)
|   
| - megadoc-plugin-js       (namespace id = JS)
|   |
|   |-- X                   (filePath = js/lib/X.js)
|   |-- Core.X              (filePath = js/lib/core/X.js)
|   |   |-- @id
|   |   |-- #add
|   |-- Core.Y              (filePath = js/lib/core/Y.js)
|   |   |-- @id
|   |-- Z                   (filePath = js/lib/Z.js)
```

The following table shows the resolving behavior:

Context Node     | Link         | Resolved Node
---------------- | ------------ | -----------------
JS/Core.X@id     | X            | JS/Core.X
JS/Core.X@id     | JS/X         | JS/X
JS/Core.X@id     | MD/X         | MD/X
JS/Core.X#add    | @id          | JS/Core.X@id
JS/Core.X#add    | Y@id         | JS/Core.Y@id
JS/Core.X#add    | Core.Y@id    | JS/Core.Y@id
JS/Core.X#add    | JS/Core.Y@id | JS/Core.Y@id
JS/Core.Y        | X            | JS/Core.X
JS/Core.Y        | #add         | ! (unknown)
JS/Core.Y        | X#add        | JS/Core.X#add
JS/Core.Y        | X.js         | ! (ambiguous)
JS/Core.Y        | ./X.js       | JS/Core.X
JS/Core.Y        | ../X.js      | JS/X
JS/Z             | X            | JS/X
MD/X             | X            | MD/X
MD/X             | Core.X       | JS/Core.X
MD/Y             | X            | MD/X

## The AST

At the root of the corpus, we have a singleton node of type `Corpus` that
houses a set of `Namespace` nodes. Each plugin that registers with the corpus
has to define its own unique `Namespace` node and nest its documents underneath
it.

A `Namespace` node is the direct owner of a plugin's `Document` nodes. However,
from that point down, the hierarchy is flexible in that a `Document` node may
contain either `Document` nodes as children (namespacing at the plugin level)
or leaf `DocumentEntity` nodes.

This architecture is flexible enough to support a wide array of documentation 
schemes; most kinds of textual documentation, public API references, library 
documentation, etc., can be structured within this model.

```javascript
def("Corpus", {
  fields: {
    namespaces: array("Namespace")
  }
});

def("Namespace", {
  fields: {
    id: String,
    symbol: or(String, null), // defaults to "/"
    corpusContext: or(String, null),
    documents: or(array("Document"), null),
    parentNode: "Corpus"
  }
});

def("Node", {
  fields: {
    id: String,
    href: or(String, null),
    title: or(String, null),
    summary: or(String, null),
    filePath: or(String, null),
    properties: or(array("Property"), null)
  }
});

def("Document", {
  base: "Node",
  fields: {
    symbol: or(String, null),
    parentNode: or("Namespace", "Document"),
    documents: or(array("Document"), null),
    entities: or(array("DocumentEntity"), null),
  }
});

def("DocumentEntity", { // terminal
  base: "Node",
  fields: {
    parentNode: "Document"
  }
});

def("Property", {
  build: [ 'key', 'value' ],
  fields: {
    key: String,
    value: or(String, Number, Boolean, RegExp, Array, Object, null)
  }
});
```

A sample AST for the example above:

```javascript
// JS/Core.X@id -> [[X]] -> JS/Core.X
// JS/Core.X@id -> [[@id]] -> JS/Core@id
// JS/Core.X@id -> [[#add]] -> JS/Core#add

{ // DocumentEntity
  type: "DocumentEntity",
  id: "@id",
  uid: "JS/Core.X@id",
  indices: { "@id": 1, "X@id": 2, "Core.X@id": 3 },
  parentNode: { // Document
    type: "Document",
    id: "X",
    uid: "JS/Core.X",
    indices: [ "X", "Core.X" ],
    entities: [
      ...
    ],
    parentNode: { // Document
      type: "Document",
      id: "Core",
      uid: "JS/Core",
      symbol: ".",
      entities: [
        ...
      ],
      documents: [
        ...
      ],
      properties: [
        {
          key: "namespace",
          value: true
        }
      ],
      parentNode: { // Namespace
        type: "Namespace",
        id: "JS",
        uid: "JS",
        symbol: "/",
        corpusContext: "JavaScript Modules",
        documents: [
          ...
        ],
        parentNode: { // Corpus
          type: "Corpus",
          namespaces: [
            ...
          ]
        }
      }
    }
  }
};
```

## TODO

- resolving by filepath
- customizing the index fields (e.g. for JS's @alias tag support)
- resolved link title should be tuned based on the contextNode's scope - private scopes should not use the FQN-index and so on