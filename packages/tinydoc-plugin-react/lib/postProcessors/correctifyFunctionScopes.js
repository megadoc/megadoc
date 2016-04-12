var where = require('lodash').where;
var K = require('tinydoc-plugin-js/lib/Parser/constants');

module.exports = function(database) {
  database
    .filter(function(doc) {
      return doc.isModule && doc.ctx.type === 'component';
    })
    .forEach(function(doc) {
      where(database, { receiver: doc.id }).forEach(function(entityDoc) {
        if (entityDoc.ctx.type === K.TYPE_FUNCTION) {
          if (doc.ctx.statics.indexOf(entityDoc.name) > -1) {
            entityDoc.id = [ doc.id, entityDoc.name ].join('.');
            entityDoc.ctx.scope = K.SCOPE_UNSCOPED;
            entityDoc.ctx.symbol = '.';
          }
          else {
            entityDoc.id = [ doc.id, entityDoc.name ].join('#');
            entityDoc.ctx.symbol = '#';
            entityDoc.ctx.scope = K.SCOPE_INSTANCE;
          }
        }
      });
    })
  ;
};