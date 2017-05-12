const Subject = require('../DocumentResolver');
const CorpusAPI = require('core/CorpusAPI');
const DocumentURI = require('core/DocumentURI');
const { assert } = require('chai');
const corpusData = require('json!test_helpers/fixtures/corpus.json');

describe('megadoc::DocumentResolver', function() {
  let corpus, documentURI, subject;

  beforeEach(function() {
    corpus = CorpusAPI({
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
        pathname: '/api/Database.html'
      });

      tap(subject.resolveFromLocation(location), x => {
        assert.equal(x.documentNode.uid, 'api/Database');
      });
    });

    context.skip('when an override exists for the current URL in layoutOptions', function() {
      it('resolves with the document specified by its UID', function() {
        const location = HTTPLocation({
          pathname: '/api.html'
        });

        const config = {
          layoutOptions: {
            customLayouts: [
              {
                match: { by: 'url', on: '*' },
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
          pathname: '/foo.html'
        });

        const config = {
          layoutOptions: {
            customLayouts: [
              {
                match: { by: 'url', on: '/foo.html' },
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