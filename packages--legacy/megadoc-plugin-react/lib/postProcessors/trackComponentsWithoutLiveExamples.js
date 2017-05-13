module.exports = function(database, track) {
  database
    .filter(function(doc) {
      return doc.isModule && doc.type === 'component';
    })
    .forEach(function(doc) {
      track(doc.filePath, doc.name);
    })
  ;
};