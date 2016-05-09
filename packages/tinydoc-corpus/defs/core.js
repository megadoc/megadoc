var CorpusTypes = require('../lib/CorpusTypes');
var def = CorpusTypes.def;
var or = CorpusTypes.or;
var array = CorpusTypes.array;
var t = CorpusTypes.builtInTypes;

/**
 * @module T.Corpus
 */
def("Corpus", {
  fields: {
    meta: t.object,
    namespaces: array("Namespace")
  }
});

/**
 * @module T.Namespace
 */
def("Namespace", {
  fields: {
    id: t.string,
    title: or(t.string, null),
    symbol: or(t.string, null), // defaults to "/"
    documents: or(array("Node"), null),
    meta: or(t.object, null),
    config: or(t.object, null),
    parentNode: "Corpus",
  }
});

/**
 * @module T.Node
 */
def("Node", {
  fields: {
    id: t.string,
    href: or(t.string, null),
    title: or(t.string, null),
    summary: or(t.string, null),
    filePath: or(t.string, null),
    meta: or(t.object, null),
    properties: or(array("Property"), t.object, null),
    parentNode: or("Namespace", "Node")
  }
});

/**
 * @module T.Document
 * @mixes T.Node
 */
def("Document", {
  base: "Node",
  fields: {
    symbol: or(t.string, null), // defaults to "/"
    parentNode: or("Namespace", "Document"),
    documents: or(array("Document"), null),
    entities: or(array("DocumentEntity"), null),
  }
});

/**
 * @module T.DocumentEntity
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
  fields: {
    key: t.string,
    value: or(t.string, t.number, t.boolean, t.regExp, t.array, t.object, null)
  }
});