var K = require('../constants');
var assign = require('lodash').assign;

function NodeInfo(node, filePath) {
  this.id = undefined;
  this.receiver = undefined;
  this.loc = { start: node.loc.start, end: node.loc.end };
  this.fileLoc = filePath + ':' + this.loc.start.line;
  this.ctx = {
    type: K.TYPE_UNKNOWN,
    scope: K.SCOPE_UNSCOPED
  };

  return this;
}

NodeInfo.prototype.toJSON = function() {
  return {
    id: this.id,
    ctx: this.ctx,
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

NodeInfo.prototype.markAsExports = function() {
  this.$isExports = true;
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