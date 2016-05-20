var parseProperty = require('./Tag/parseProperty');
var extractDefaultValue = require('./Tag/extractDefaultValue');
var neutralizeWhitespace = require('./Tag/neutralizeWhitespace');
var K = require('../constants');
var assert = require('assert');

var TypeAliases = {
  'returns': 'return'
};

/**
 * @param {Object} doxTag
 * @param {Object} options
 * @param {Object} options.customTags
 * @param {Boolean} [options.namedReturnTags=true]
 *
 * @param {String} filePath
 */
function Tag(doxTag, options, filePath) {
  var customTags = options.customTags;

  /**
   * @property {String}
   *           The type of this tag. This is always present.
   */
  this.type = TypeAliases[doxTag.type] || doxTag.type;

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

  this.mixinTargets = [];

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

  switch(this.type) {
    case 'property':
    case 'param':
    case 'return':
    case 'throws':
    case 'example':
    case 'interface':
      this.typeInfo = TypeInfo(doxTag);

      // fixup for return tags when we're not expecting them to be named
      if (this.type === 'return' && this.typeInfo.name && options.namedReturnTags === false) {
        this.typeInfo.description = this.typeInfo.name + ' ' + this.typeInfo.description;
        this.typeInfo.name = undefined;
      }

      break;

    case 'type':
      // console.assert(doxTag.types.length === 1,
      //   "Expected @type tag to contain only a single type, but it contained %d.",
      //   doxTag.types.length
      // );
      this.typeInfo = TypeInfo(doxTag);
      this.string = this.string.replace(doxTag.string, '');

      if (doxTag.types.length === 1) {
        this.explicitType = renamePrimitiveType(doxTag.types[0].trim());
      }

      break;

    // if it was marked @method, treat it as such (not stupid "property" type
    // on object modules)
    case 'method':
      this.explicitType = K.TYPE_FUNCTION;
      this.typeInfo = TypeInfo(doxTag);

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

    case 'mixes':
      var firstLine = this.string.split('\n')[0].trim();
      this.mixinTargets = firstLine.split(/\s+/);
      this.string = this.string.replace(firstLine, '');
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
    this.typeInfo = TypeInfo(doxTag);
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

function renamePrimitiveType(type) {
  if (type === 'Function') {
    return 'function';
  }
  else {
    return type;
  }
}

function TypeInfo(doxTag) {
  var typeInfo = parseProperty(doxTag.string);

  if (typeInfo.description) {
    typeInfo.description = neutralizeWhitespace(typeInfo.description);
  }

  if (typeInfo.name) {
    if (doxTag.name && doxTag.name !== typeInfo.name) {
      typeInfo.name = doxTag.name;
      typeInfo.description = doxTag.description;
    }

    var nameFragments = extractDefaultValue(typeInfo.name);

    if (nameFragments) {
      typeInfo.name = nameFragments.name;
      typeInfo.defaultValue = nameFragments.defaultValue;
    }
  }


  return typeInfo;
}
