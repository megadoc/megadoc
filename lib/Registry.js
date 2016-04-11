/**
 * @namespace Core
 *
 * A module that contains the indices used for linking to objects. The registry
 * is populated during compilation in the "index" phase.
 */
function Registry() {
  this.indices = {};
  this.tokens = [];
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
  this.indices[id] = entry;
};

Registry.prototype.get = function(id) {
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

Registry.prototype.addSearchToken = function(token) {
  this.tokens.push(token);
};

Object.defineProperty(Registry.prototype, 'size', {
  get: function() {
    return Object.keys(this.indices).length;
  }
});

module.exports = Registry;