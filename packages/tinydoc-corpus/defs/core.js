var CorpusTypes = require('../lib/CorpusTypes');
var def = CorpusTypes.def;
var or = CorpusTypes.or;
var array = CorpusTypes.array;

/**
 * @module T.Corpus
 */
def("Corpus", {
  fields: {
    namespaces: array("Namespace")
  }
});

/**
 * @module T.Namespace
 */
def("Namespace", {
  fields: {
    id: String,
    symbol: or(String, null), // defaults to "/"
    corpusContext: or(String, null),
    documents: or(array("Document"), null),
    parentNode: "Corpus"
  }
});

/**
 * @module T.Node
 */
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

/**
 * @module T.Document
 * @mixes T.Node
 */
def("Document", {
  base: "Node",
  fields: {
    symbol: or(String, null),
    parentNode: or("Namespace", "Document"),
    documents: or(array("Document"), null),
    entities: or(array("DocumentEntity"), null),
  }
});

/**
 * @module T.Document
 * @mixes T.Node
 */
def("DocumentEntity", { // terminal
  base: "Node",
  fields: {
    parentNode: "Document"
  }
});

/**
 * @module T.Property
 */
def("Property", {
  build: [ 'key', 'value' ],
  fields: {
    key: String,
    value: or(String, Number, Boolean, RegExp, Array, Object, null)
  }
});