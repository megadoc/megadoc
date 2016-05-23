var K = require('./constants');
var assign = require('lodash').assign;
var getLocation = require('./ASTUtils').getLocation;

/**
 * @param {recast.ast} node
 *        The AST node we represent.
 *
 * @param {String} filePath
 */
function NodeInfo(node, filePath) {
  var loc = getLocation(node);

  this.id = undefined;
  this.receiver = undefined;
  this.loc = { start: loc.start, end: loc.end };
  this.fileLoc = filePath + ':' + this.loc.start.line;
  this.filePath = filePath;
  this.ctx = {
    type: K.TYPE_UNKNOWN,
    scope: K.SCOPE_UNSCOPED
  };

  return this;
}

NodeInfo.prototype.toJSON = function() {
  return {
    id: this.id,
    receiver: this.receiver,
    loc: this.loc,
  };
};

NodeInfo.prototype.setContext = function(ctx) {
  this.ctx = ctx;
};

NodeInfo.prototype.addContextInfo = function(ctx) {
  assign(this.ctx, ctx);
};

/**
 * Mark the module represented by this NodeInfo as a module.
 * This can be used by plugins to adjust the module status of objects.
 */
NodeInfo.prototype.markAsModule = function() {
  this.$isModule = true;
};

NodeInfo.prototype.markAsExports = function() {
  this.$isExports = true;
};

NodeInfo.prototype.isModule = function() {
  return Boolean(this.$isModule || this.$isExports);
};

NodeInfo.prototype.isExports = function() {
  return Boolean(this.$isExports);
};

NodeInfo.prototype.markAsDestructuredObject = function() {
  this.$isDestructured = true;
};

NodeInfo.prototype.isDestructuredObject = function() {
  return Boolean(this.$isDestructured);
};

NodeInfo.prototype.markAsInstanceProperty = function() {
  this.$scope = K.SCOPE_INSTANCE;
};

NodeInfo.prototype.markAsPrototypeProperty = function() {
  this.$scope = K.SCOPE_PROTOTYPE;
};

NodeInfo.prototype.isInstanceEntity = function() {
  return this.$scope === K.SCOPE_INSTANCE;
};

NodeInfo.prototype.isPrototypeEntity = function() {
  return this.$scope === K.SCOPE_PROTOTYPE;
};

// NodeInfo.prototype.getScope = function() {
//   if (this.$isInstanceProperty) {
//     return K.SCOPE_INSTANCE;
//   }
// };

module.exports = NodeInfo;