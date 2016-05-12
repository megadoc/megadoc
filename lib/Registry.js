var assert = require('assert');

/**
 * @namespace Core
 *
 * A module that contains the indices used for linking to objects. The registry
 * is populated during compilation in the "index" phase.
 */
function Registry() {
}

/**
 * Add an index.
 *
 * @param {String} id
 *        The id of the index. This is what the users will use to refer to the
 *        object represented by this index.
 *
 *        For example, for markdown articles, this would be the path of the
 *        document:
 *
 *        ```
 *        "/doc/something.md"
 *        ```
 *
 *        And as such, the users will use `\[/doc/something.md]()` to link to
 *        that article.
 *
 * @param {Object} entry
 *        Any necessary contextual data you will need later to resolve this
 *        index. Things like doc ID or title or such.
 */
Registry.prototype.add = function(id, entry) {
  assert(false, "Deprecated: use Compiler@corpus instead.");

  this.indices[id] = entry;
};

Registry.prototype.get = function(id) {
  assert(false, "Deprecated: use Compiler@corpus instead.");

  return this.indices[id];
};

/**
 * @return {Object<String,Object>}
 *         The defined indices. The key is the path to the index, and the value
 *         is the index data.
 */
Registry.prototype.toJSON = function() {
  return {
    indices: this.indices,
    tokens: this.tokens
  };
};

/**
 * Define a search token that will be used in the Spotlight/Quick-Find index for
 * jumping to a document.
 *
 * @param {Object} token
 * @param {String} token.$1
 *        The most accurate title for the document that should uniquely describe
 *        it without any ambiguity (as much as possible, at least.)
 *
 * @param {String?} token.$2
 *        A second candidate title for the document. Maybe something like a
 *        filepath.
 *
 * @param {String?} token.$3
 *        A third and least prioritized candidate title for the document.
 *
 * @param {Object} token.link
 * @param {String} token.link.href
 *        The **absolute** URL of the document within the rendered app. Must
 *        start with '/'.
 */
Registry.prototype.addSearchToken = function(token) {
  assert(false, "Deprecated: use Compiler@corpus instead.");
  this.tokens.push(token);
};

Registry.prototype.getCorpus = function() {
  assert(false, "Deprecated: use Compiler@corpus instead.");
  return this.tokens;
};

Object.defineProperty(Registry.prototype, 'size', {
  get: function() {
    return Object.keys(this.indices).length;
  }
});

module.exports = Registry;