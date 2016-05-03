var HTMLSerializer = require('../HTMLSerializer');
var TestUtils = require('../TestUtils');
var Compiler = require('../Compiler');
var assert = require('assert');
var CorpusTypes = require('tinydoc-corpus').Types;
var b = CorpusTypes.builders;

describe('HTMLSerializer', function() {
  TestUtils.IntegrationSuite(this);

  describe('.index', function() {
    var compiler, corpus;

    beforeEach(function(done) {
      compiler = new Compiler(TestUtils.generateTestConfig());
      corpus = compiler.corpus;
      HTMLSerializer({}).run(compiler);

      corpus.add(
        b.namespace({
          id: 'A',
          documents: [
            b.document({
              id: 'foo',
              title: 'Foo',
              symbol: '/',
              entities: [
                b.documentEntity({
                  id: 'someProp'
                })
              ]
            })
          ]
        })
      );

      corpus.add(
        b.namespace({
          id: 'B',
          meta: {
            href: '/api',
          },
          documents: [
            b.document({
              id: 'foo',
              title: 'Foo',
              symbol: '/',
              entities: [
                b.documentEntity({
                  id: 'someOtherProp'
                })
              ]
            })
          ]
        })
      );

      compiler.run({ scan: true, index: true, }, function(err) {
        if (err) { return done(err); }

        done();
      });
    });

    describe('Namespace URIs', function() {
      it('should generate an @href for a namespace', function() {
        assert.equal(corpus.get('A').meta.href, '/A');
      });

      it('should use a pre-defined namespace @href', function() {
        assert.equal(corpus.get('B').meta.href, '/api');
      });
    });

    describe('Document URIs', function() {
      it('should generate an @href for every document within a namespace', function() {
        assert.equal(corpus.get('A/foo').meta.href, '/A/foo');
        assert.equal(corpus.get('B/foo').meta.href, '/api/foo');
      });
    });

    describe('DocumentEntity URIs', function() {
      it('should generate an @href for every document entity as a hashtag', function() {
        assert.equal(corpus.get('A/foo/someProp').meta.href, '/A/foo#A/foo/someProp');
        assert.equal(corpus.get('B/foo/someOtherProp').meta.href, '/api/foo#B/foo/someOtherProp');
      });
    });
  });
});
