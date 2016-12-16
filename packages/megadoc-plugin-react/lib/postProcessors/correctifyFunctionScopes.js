var where = require('lodash').where;
var K = require('jsdoc-parser-extended').Constants;

module.exports = function(database) {
  database
    .filter(function(doc) {
      return doc.isModule && doc.type === 'component';
    })
    .forEach(function(doc) {
      where(database, { receiver: doc.id }).forEach(function(entityDoc) {
        if (entityDoc.type === K.TYPE_FUNCTION) {
          if (doc.nodeInfo.statics.indexOf(entityDoc.name) > -1) {
            entityDoc.id = [ doc.id, entityDoc.name ].join('.');
            entityDoc.nodeInfo.scope = K.SCOPE_UNSCOPED;
            entityDoc.symbol = '.';
          }
          else {
            entityDoc.id = [ doc.id, entityDoc.name ].join('#');
            entityDoc.symbol = '#';
            entityDoc.nodeInfo.scope = K.SCOPE_INSTANCE;
          }
        }
      });
    })
  ;
};