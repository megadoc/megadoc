const { assert } = require('chai');
const subject = require('../reduceFn');

describe('megadoc-plugin-js::reduceFn', function() {
  it('works with a module document', function(done) {
    const rawDocument = {
      id: 'beep',
      name: 'beep',
      isModule: true
    };

    subject({}, rawDocument, function(err, document) {
      if (err) {
        done(err);
      }
      else {
        assert.include(document, {
          id: 'beep',
          type: 'Document'
        }, 'it uses the id as an @id');

        done();
      }
    })
  });

  it('works with a namespace document', function(done) {
    const rawDocument = {
      id: 'SomeNamespace',
      name: 'SomeNamespace',
      symbol: '.',
      isNamespace: true
    };

    subject({}, rawDocument, function(err, document) {
      if (err) {
        done(err);
      }
      else {
        assert.include(document, {
          id: 'SomeNamespace',
          type: 'Document',
        }, 'it uses the id as an @id');

        done();
      }
    })
  });

  it('works with an entity document', function(done) {
    const rawDocument = {
      id: 'Truck#beep',
      name: 'beep',
      symbol: '#',
      isModule: false
    };

    subject({}, rawDocument, function(err, document) {
      if (err) {
        done(err);
      }
      else {
        assert.include(document, {
          id: '#beep',
          type: 'DocumentEntity'
        }, 'it uses the symbol and the id for an @id');

        done();
      }
    })
  });
});