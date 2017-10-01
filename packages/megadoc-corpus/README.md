# megadoc-corpus

The corpus is megadoc's model for indexing documents. It is a database (or, a 
graph) of _abstract_ representations of documentation.

The corpus has enough semantics to provide a powerful and intuitive 
implementation for resolving links, among other things like plotting
dependency and co-relation graphs between documents.

Megadoc's HTML serializer is entirely powered by the corpus and exposes 
[CorpusAPI an API]() for interacting with it - so as an upstream 
developer, learning how to use and utilize the corpus will pay off greatly.

## Design

The corpus is formed initially as a tree of nodes, each representing either a
document or an entity inside a document, grouped by what are called _namespace_
nodes.

What a document or document entity is is context-specific and, in practice, 
irrelevant to the corpus - all it cares about is an abstract representation of 
those documents that allows us to treat the database in a generic manner.

The distinction in the codebase and this documentation between documents or 
document entities themselves and their corpus representation is made by the 
use of the word "node". So, when we're talking about a node, it would mean the
abstract node in the corpus and not the underlying document. The actual 
documents and document entities themselves referred to as, simply, a document, 
a document entity, or an entity for brevity.

### The Abstract Document Tree (ADT)

Each node in the corpus must have an id and a type. Types are pre-defined and
may be one of `Namespace`, `Document`, or `DocumentEntity`.

At the root of the corpus, we have a singleton node of type `Corpus` that
houses a set of `Namespace` nodes. Each plugin that registers with the corpus
has to define its own unique `Namespace` node and nest its documents underneath
it.

```dot
[<frame>Corpus Model|
  [Corpus]
  [Corpus] -> [JavaScripts]
  [Corpus] -> [Markdown]
  [JavaScripts] -> [Core]
  [Core] -> [X]
  [X] -> [#add]
  [JavaScripts] -> [Y]
  [Y] -> [@name]
  [Y] -> [#speak]
  [Markdown] -> [Article A]
]
```

A `Namespace` node is the direct owner of a plugin's `Document` nodes. However,
from that point down, the hierarchy is flexible in that a `Document` node may
contain either `Document` nodes as children (namespacing at the plugin level)
or leaf `DocumentEntity` nodes.

This architecture is flexible enough to support a wide array of documentation 
schemes; most kinds of textual documentation, public API references, library 
documentation, etc., can be structured within this model.

### UIDs

Each node added to the corpus is stamped with a `uid` - an identifier that is
guaranteed to be unique among all nodes and can always be used to reference 
the exact document, although it's usually not human-friendly. To address that,
we get to indexing...

## Indexing

A lot of care has gone into making the algorithm and heuristics behind 
resolving links to documents provide for an _intuitive_ and natural experience 
for the author. The effect it strives to achieve is that "It Just Works". For 
this reason, the implementation is heavily influenced by the node from which a 
link is being made - the _context node_.

For every node added to the corpus, a list of _indices_ is built. An index
represents a **term that can be used to link to a node** - but only from a 
specific context. Some indices are _private_, a semantic for indicating that 
the term may only be used by the document itself (i.e. when referencing its 
entities), entities amongst each other, and _friends_ which we'll touch upon
later.

The indices generated for a node are customizable. We cover the process in
great detail over in the [/doc/dev/using-the-corpus.md#tuning-the-indexer corpus usage guide]().

### The resolver

The corpus resolver performs a depth-first search in the ADT to resolve the 
node that is being linked to. The parameters needed for resolving are the 
term, and the _context node_.

### Constraints

- Document identifiers MUST NOT begin with any of the following characters:
  1. `./` (a dot followed by a forward slash)
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

    \[[./path/to/file]]

### Resolving by (absolute) filepath

Any link that begins with `/` is expected to point to a document that can be
found at that path, relative to the [[Config.assetRoot]]:

    \[[/path/to/file]]

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

Here's a visual example (although it does not fully conform to the table
above):

![A visualization of the table above](/images/corpus-resolver.png)

### Friend nodes

When resolving an index from a certain context node, we will consider the 
indices in a binary fashion: either indices that are private or public. Private
indices are ones that are semantically too specific to be linked to outside the
scope they were defined in; in our example above, `JS/Core.X@id` would have
a private index of `@id` which would not make much sense once we're outside of
`JS/Core.X`.

However, this rule is broken in one case, and is modeled as a friendship 
between nodes. Nodes that are considered "friends" can peek into each others'
private indices but _not_ their entity indices. The reason for this will be
explained after we look at the following table:

```
| -- JS
|    |-- X
|    |-- Y
|    |-- Core
|        |-- X         <- friends: [Core], can access Core.Y using "Y"
|        |   |-- @id   <- friends: [X, Core], can access Core.X#add using "#add"
|        |   |-- #add
|        |-- Y         <- friends: [Core], can access Core.X using "X"
|        |   |-- @name <- friends: [Y, Core], can NOT access Core.X#add using "#add"!!!
|    |-- Z             <- friends: [NS1]
```

It so happens that when you're authoring docs in a context like the `Core.X` 
document above, you would naturally want to link to other related documents by
their "short names", which to the corpus are private indices. For this reason,
`Core.X` is considered a friend of Core.Y and may call it by its "short name",
`Y`.

In order to support this style of linking, but still protect from _invalid_ 
links, we prohibit nodes from accessing their friends' entity indices. So,
in `Core.X`, you may not link to `@name` which resides in `Y` - only using
`Y@name`.

## ADT Types

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
// JS/Core.X@id -> \[[X]] -> JS/Core.X
// JS/Core.X@id -> \[[@id]] -> JS/Core@id
// JS/Core.X@id -> \[[#add]] -> JS/Core#add

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

- resolved link title should be tuned based on the contextNode's scope - private scopes should not use the FQN-index and so on
