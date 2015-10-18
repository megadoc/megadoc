var parseProperty = require('./Tag/parseProperty');
var neutralizeWhitespace = require('./Tag/neutralizeWhitespace');
var K = require('../constants');
var assert = require('assert');

function renamePrimitiveType(type) {
  if (type === 'Function') {
    return 'function';
  }
  else {
    return type;
  }
}

/**
 * @namespace Plugins.CJS
 *
 * @param {Object} doxTag
 * @param {Object} customTags
 * @param {String} filePath
 */
function Tag(doxTag, customTags, filePath) {
  /**
   * @property {String}
   *           The type of this tag. This is always present.
   */
  this.type = doxTag.type;

  /**
   * @property {String}
   *           The raw text.
   */
  this.string = String(doxTag.string || '')

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
     * @property {String}
     */
    description: null,

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
    case 'throws':
    case 'example':
      this.typeInfo = parseProperty(doxTag.string);

      if (this.typeInfo.description) {
        this.typeInfo.description = neutralizeWhitespace(this.typeInfo.description);
      }

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

    default:
      if (customTags && customTags.hasOwnProperty(doxTag.type)) {
        this.useCustomTagDefinition(doxTag, customTags[doxTag.type], filePath);
      }
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

Tag.prototype.useCustomTagDefinition = function(doxTag, customTag, filePath) {
  var customAttributes = customTag.attributes || [];

  if (customTag.withTypeInfo) {
    this.typeInfo = parseProperty(doxTag.string);
  }

  if (customTag.process instanceof Function) {
    customTag.process(createCustomTagAPI(this, customAttributes), filePath);
  }
};

function createCustomTagAPI(tag, attrWhitelist) {
  var api = tag.toJSON();

  api.setCustomAttribute = function(name, value) {
    assert(attrWhitelist.indexOf(name) > -1,
      "Unrecognized custom attribute '" + name + "'. Make sure you " +
      "you specify it in the @attributes array for the customTag."
    );

    tag[name] = value;
  };

  return api;
}

module.exports = Tag;