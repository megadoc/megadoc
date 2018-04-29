const fs = require('fs');

module.exports = function parseBulkFn(context, files, done) {
  const database = files.map(function(fileName) {
    const doc = JSON.parse(fs.readFileSync(fileName, 'utf-8'));

    if (doc.objects) {
      doc.objects.forEach(function(objectDoc) {
        if (objectDoc.title) {
          objectDoc.shorthandTitle = 'API::' + objectDoc.title;
        }
      });
    }

    return doc;
  });

  done(null, database);
}
