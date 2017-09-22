var CorpusTypes = require('../lib/CorpusTypes');
var def = CorpusTypes.def;
var or = CorpusTypes.or;
var array = CorpusTypes.array;
var t = CorpusTypes.builtInTypes;

/**
 * @namespace T
 *
 * Corpus type definitions.
 *
 * Each definition listed here can be "built" using the functions found in
 * [CorpusTypes@builders](). Each builder will be named after the type's name
 * but in camelCase fashion - so, the builder for "Namespace" would be
 * `b.namespace`, the one for "DocumentEntity" would be `b.documentEntity` and
 * so on.
 *
 * Here's an example of building a Namespace node with a Document:
 *
 * ```javascript
 * var b = require('megadoc-corpus').builders;
 *
 * b.namespace({
 *   id: 'my-ns',
 *   documents: [
 *     b.document({
 *       id: 'some document'
 *     })
 *   ]
 * });
 * ```
 */

/**
 * @module T.Corpus
 * @preserveOrder
 *
 * The root corpus node. You do not directly build or interact with this node,
 * only through the [../lib/Corpus.js public api]().
 */
def("Corpus", {
  fields: {
    meta: t.object,

    /**
     * @property {String[]} indexFields
     *
     * The fields that should be considered by the indexer for building indices
     * for nodes. The set defined on [T.Corpus]() is the default set of index
     * fields that will be used for all nodes unless they override them.
     *
     * See [[/doc/dev/using-the-corpus.md#tuning-the-indexer]] for more information
     * about this field.
     *
     * Defaults to: `[ "$uid", "$filePath" ]`
     */
    indexFields: array(t.string),

    /**
     * @property {T.Namespace[]}
     *
     * The list of namespace nodes contained within the corpus.
     */
    namespaces: array("Namespace")
  }
});

/**
 * @module T.Namespace
 * @preserveOrder
 */
def("Namespace", {
  fields: {
    /**
     * @property {!String}
     *
     * An identifier for this namespace that must be unique at this level in the
     * corpus. The identifier is utilized in the generation of [CorpusUIDs UIDs]()
     * and will consequently effect the generated URLs and paths of the generated
     * .html files.
     */
    id: t.string,

    /**
     * @property {!String}
     *
     * A name to be used internally for the namespace. This property is meant to
     * identify the "class" of the namespace; or in other words, the type of
     * documents the namespace will contain.
     *
     * Since the Corpus does not allow you to define custom types and it may
     * [[sometimes be necessary| UI.Inspector]] to identify where a certain
     * document comes from, the name can be used in its place.
     *
     * The name can be shared, and is usually equal to the name of the plugin
     * that is generating this namespace (e.g. "megadoc-plugin-markdown".)
     */
    name: t.string,

    /**
     * @property {String?} [title=null]
     *
     * A human-friendly title for display for this namespace. The title will be
     * utilized in the UI any time we need to reference this namespace, like in
     * the [[Spotlight]] or plugin root-level pages (aka "index" pages) that
     * list all the documents available.
     *
     * Example values: "Articles" for a markdown namespace, "JavaScripts" for
     * JS source files, "API" for Rails or Python API source files, etc.
     */
    title: or(t.string, null),

    /**
     * @property {String?} [symbol="/"]
     *
     * The symbol is used when generating [[UIDs | CorpusUIDs]] for documents
     * in the namespace; their UID will effectively be their [[T.Node@id]]
     * delimited by this symbol.
     *
     * Usually, you would not need to customize the symbol at the namespace
     * level and can safely leave it as "/".
     *
     * For example:
     *
     * ```dot
     * #direction: right
     * [T.Namespace(X)] / -> [T.Document(A)]
     * ```
     *
     * Document A above will have a UID of `X/A`.
     */
    symbol: or(t.string, null),

    /**
     * @property {String[]} [indexFields=null]
     *
     * Override the default [[T.Corpus@indexFields]].
     *
     * A reason to override the default index fields may be that your documents
     * should not be indexed by their file-paths for example, or that they may
     * have additional fields that _should_ be indexed, like is the case in the
     * `@alias` tag for JavaScript sources; the documents there should be
     * identified by either their original identifiers or one of their aliases.
     *
     * @see /doc/dev/using-the-corpus.md#tuning-the-indexer
     */
    indexFields: or(array(t.string), null),

    /**
     * @inheritdoc T.Corpus@meta
     */
    meta: or(t.object, null),

    /**
     * @property {Object?}
     *
     * A good place to inject the user config needed by the UI for your plugin.
     */
    config: or(t.object, null),

    /**
     * @property {T.Document[]}
     */
    documents: or(array("Node"), null),
  }
});

/**
 * @module T.Node
 * @interface
 * @preserveOrder
 */
def("Node", {
  fields: {
    /**
     * @property {String}
     *
     * See [T.Namespace@id]
     */
    id: t.string,

    /**
     * @property {String}
     *
     * See [T.Namespace@title]
     */
    title: or(t.string, null),

    /**
     * @property {String}
     */
    summary: or(t.string, null),
    summaryFields: or(array(t.string), null),

    /**
     * @property {String}
     *
     * The file path that this document originates from.
     *
     * The file path MUST be relative to the [[Config@assetRoot]] and starts
     * with a forward slash.
     */
    filePath: or(t.string, null),

    loc: or(t.object, null),

    /**
     * @inheritdoc T.Corpus@meta
     */
    meta: or(t.object, null),

    /**
     * @inheritdoc T.Namespace@meta
     */
    indexFields: or(array(t.string), null),

    indices: or(t.object, null),

    /**
     * @property {Object[]}
     *
     * This is the place to inject the underlying document properties. You may
     * attach whatever kind of properties you need here that were not already
     * represented by the document's abstract representation (this node.)
     */
    properties: or(array("Property"), t.object, null),
  }
});

/**
 * @module T.Document
 * @mixes T.Node
 *
 * A document is the "meat" of the Corpus, or its "building block". What a
 * document node may contain is context-specific. For example, in the context of
 * Markdown, a document would be the actual article. Whereas in the context of a
 * programming language, a document could be a class, a module, or a function.
 *
 * ```dot
 * [mega://T.Corpus] -> [mega://T.Namespace]
 * [mega://T.Namespace] -> [mega://T.Document]
 * ```
 *
 * Documents can be nested beneath each other. This is very useful for
 * representing ancestry chains, like in the case of programming languages that
 * support namespacing like Ruby (`::`), C++ (`::`), or even _virtual_ namespaces
 * as can be achieved in JavaScript comments (e.g. the `@namespace` tag).
 *
 * ```dot
 * [Core | mega://T.Document] -> [Core::Cache     | mega://T.Document]
 * [Core | mega://T.Document] -> [Core::Renderer  | mega://T.Document]
 * ```
 *
 * A document can have [[entities | T.DocumentEntity]] which are _leaf nodes_
 * in the tree. Refer to their documentation for more information.
 */
def("Document", {
  base: "Node",
  fields: {
    /**
     * @property {String} symbol
     */
    symbol: or(t.string, null), // defaults to "/"

    /**
     * @property {String}
     *
     * The UID of the parent node this node belongs to which may either be a
     * [[T.Document]] or a [[T.Namespace]]. You can "nest" documents within each
     * other by attaching a [[T.Document]] node to another as its parentNode.
     *
     * If the parentNode is of type [[T.Namespace]], then it means that this
     * document is a top-level one.
     *
     */
    parentNodeId: or(t.string, null),
    documents: or(array("Document"), null),
    entities: or(array("DocumentEntity"), null),
  }
});

/**
 * @module T.DocumentEntity
 * @mixes T.Node
 *
 * A document entity represents something that is not a document by itself but
 * rather part of one. For example, in the context of a Markdown article, its
 * entities may be the sections or headers, whereas in a document for a class
 * in a programming language, its entities can be the methods and properties the
 * class exposes.
 *
 * ```dot
 * #direction: right
 * [Cache | mega://T.Document] -> [@id                  | mega://T.DocumentEntity]
 * [Cache | mega://T.Document] -> [#add()               | mega://T.DocumentEntity]
 * [Cache | mega://T.Document] -> [#remove()            | mega://T.DocumentEntity]
 * [Cache | mega://T.Document] -> [#clear()             | mega://T.DocumentEntity]
 * [Cache | mega://T.Document] -> [.createInstance()    | mega://T.DocumentEntity]
 * ```
 */
def("DocumentEntity", { // terminal
  base: "Node",
  fields: {
    /**
     * @property {String}
     *
     * The UID of the documentNode that this entity belongs to.
     */
    parentNodeId: or(t.string, null),
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