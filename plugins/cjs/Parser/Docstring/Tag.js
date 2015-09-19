var parseProperty = require('./Tag/parseProperty');
var K = require('../constants');

function renamePrimitiveType(type) {
  if (type === 'Function') {
    return 'function';
  }
  else {
    return type;
  }
}

function Tag(doxTag) {
  /**
   * @property {String}
   *           The type of this tag. This is always present.
   */
  this.type = doxTag.type;

  /**
   * @property {String}
   *           The raw text.
   */
  this.string = String(doxTag.string || '');

  /**
   * @property {String}
   *           Module namepath pointed to by @alias.
   */
  this.alias = null;

  /**
   * @property {String} visibility
   */
  this.visibility = null;

  /**
   * @property {String}
   *           Module namepath pointed to by @memberOf.
   */
  this.explicitReceiver = null;

  /**
   * @property {String}
   *           Would be "function" for @method tags, or whatever is specified
   *           by a @type tag.
   */
  this.explicitType = null;

  /**
   * @property {String}
   *           Name of the module that is lent to by the enclosing doc.
   *
   *           Available only for @lends tags.
   */
  this.lendReceiver = null;

  /**
   * @property {String}
   *           Available on @property, @type, @param, and @live_example tags.
   */
  this.typeInfo = {
    /**
     * @property {String}
     */
    name: null,

    /**
     * @property {Boolean}
     */
    isOptional: null,

    /**
     * @property {String}
     */
    defaultValue: null,

    /**
     * @property {String[]}
     */
    types: []
  };

  switch(doxTag.type) {
    case 'property':
    case 'param':
    case 'return':
      this.typeInfo = parseProperty(doxTag.string);
      break;

    case 'live_example':
      this.typeInfo = parseProperty(doxTag.string);
      this.string = this.string.split('\n').slice(1).join('\n');
      break;

    case 'type':
      console.assert(doxTag.types.length === 1,
        "Expected @type tag to contain only a single type, but it contained %d.",
        doxTag.types.length
      );

      this.explicitType = renamePrimitiveType(doxTag.types[0].trim());
      this.string = this.string.replace('{'+doxTag.types[0]+'}', '');

      break;

    // if it was marked @method, treat it as such (not stupid "property" type
    // on object modules)
    case 'method':
      this.explicitType = 'function';
      break;

    case 'protected':
      this.visibility = K.VISIBILITY_PROTECTED;
      break;

    case 'private':
      this.visibility = K.VISIBILITY_PRIVATE;
      break;

    case 'memberOf':
      this.explicitReceiver = doxTag.parent;

      // @memberOf's "parent" property (which is the target class name) will be
      // present in the string so we remove it:
      this.string = this.string.replace(this.explicitReceiver, '');

      break;

    case 'alias':
      this.alias = this.string.split('\n')[0].trim();

      // same deal with @memberOf
      this.string = this.string.replace(this.alias, '');

      break;

    case 'lends':
      this.lendReceiver = doxTag.parent;
      break;
  }

  return this;
}

Tag.prototype.adjustString = function(newString) {
  this.string = newString;
};

Tag.prototype.toJSON = function() {
  return Object.keys(this).reduce(function(json, key) {
    if (this[key] !== null && typeof this[key] !== 'function') {
      json[key] = this[key];
    }

    return json;
  }.bind(this), {});
};

module.exports = Tag;