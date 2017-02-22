const Subject = require('../DocumentResolver');
const CorpusAPI = require('../shared/core/CorpusAPI');
const { assert } = require('chai');

describe('megadoc::DocumentResolver', function() {
  let corpus, subject;

  beforeEach(function() {
    corpus = CorpusAPI(require('json!test_helpers/fixtures/corpus.json'));
    subject = Subject(corpus);
  });

  context('using the file:// protocol', function() {

  });

  context('using the http:// protocol', function() {
    it('resolves with the document mapped to the current the URL', function() {
      const location = HTTPLocation({
        pathname: '/api/Database.html'
      });

      tap(subject.resolveFromLocation(location), x => {
        assert.equal(x.documentNode.uid, 'api/Database');
      });
    });

    context('when an override exists for the current URL in layoutOptions', function() {
      it('resolves with the document specified by its UID', function() {
        const location = HTTPLocation({
          pathname: '/index.html'
        });

        const config = {
          layoutOptions: {
            customLayouts: [
              {
                match: { by: 'url', on: '/index.html' },
                using: 'api/Database'
              }
            ]
          }
        }

        tap(subject.resolveFromLocation(location, config), x => {
          assert.equal(x.documentNode.uid, 'api/Database');
        });
      });

      it('resolves with the document specified by its URL', function() {
        const location = HTTPLocation({
          pathname: '/index.html'
        });

        const config = {
          layoutOptions: {
            customLayouts: [
              {
                match: { by: 'url', on: '/index.html' },
                using: '/api/Database.html'
              }
            ]
          }
        }

        tap(subject.resolveFromLocation(location, config), x => {
          assert.equal(x.documentNode.uid, 'api/Database');
        });
      });
    });
  });
});

function HTTPLocation(params) {
  return {
    protocol: 'http:',
    origin: params.origin || 'http://localhost:8942',
    pathname: params.pathname || '/',
    hash: params.hash || ''
  };
}

function tap(x, fn) {
  fn(x);
}