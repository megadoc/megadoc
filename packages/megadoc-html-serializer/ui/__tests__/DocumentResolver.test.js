const Subject = require('../DocumentResolver');
const DocumentURI = require('../DocumentURI');
const { createCorpus, assert } = require('test_helpers');
const corpusData = require('json!test_helpers/fixtures/corpus.json');

describe('megadoc::DocumentResolver', function() {
  let corpus, documentURI, subject;

  beforeEach(function() {
    corpus = createCorpus({
      database: corpusData,
      redirect: {},
    });

    documentURI = new DocumentURI({});

    subject = new Subject({ corpus, config: {}, documentURI });
  });

  context('using the file:// protocol', function() {

  });

  context('using the http:// protocol', function() {
    it('resolves with the document mapped to the current the URL', function() {
      const location = HTTPLocation({
        pathname: '/api/foo.html'
      });

      tap(subject.resolveFromLocation(location), x => {
        assert.equal(x.documentNode.path, 'api/foo');
      });
    });

    context.skip('when an override exists for the current URL in customLayouts', function() {
      it('resolves with the document specified by its UID', function() {
        const location = HTTPLocation({
          pathname: '/api.html'
        });

        const config = {
          customLayouts: [
            {
              match: { by: 'url', on: '*' },
              using: 'api/foo'
            }
          ]
        }

        tap(subject.resolveFromLocation(location, config), x => {
          assert.equal(x.documentNode.uid, 'api/foo');
        });
      });

      it('resolves with the document specified by its URL', function() {
        const location = HTTPLocation({
          pathname: '/foo.html'
        });

        const config = {
          customLayouts: [
            {
              match: { by: 'url', on: '/foo.html' },
              using: '/api/foo.html'
            }
          ]
        }

        tap(subject.resolveFromLocation(location, config), x => {
          assert.equal(x.documentNode.uid, 'api/foo');
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