var HTMLSerializer = require('../HTMLSerializer');
var TestUtils = require('../TestUtils');
var Compiler = require('../Compiler');
var assert = require('assert');
var CorpusTypes = require('megadoc-corpus').Types;
var b = CorpusTypes.builders;

describe('HTMLSerializer', function() {
  TestUtils.IntegrationSuite(this);

  describe('.index', function() {
    var compiler, corpus;

    function runWithConfig(config, done) {
      compiler = new Compiler(TestUtils.generateTestConfig(config));
      corpus = compiler.corpus;

      HTMLSerializer(compiler.config).run(compiler);

      if (config.database) {
        config.database.forEach(function(x) {
          corpus.add(x);
        });
      }

      compiler.run({ scan: true }, function(err) {
        if (err) { return done(err); }

        done();
      });
    }

    context('when not using hash location', function() {
      beforeEach(function(done) {
        runWithConfig({
          emittedFileExtension: '.html',
          database: [
            b.namespace({
              id: 'A',
              name: 'something',
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
                }),

                b.document({
                  id: 'bar',
                  title: 'Bar',
                  symbol: '.',
                  documents: [
                    b.document({
                      id: 'baz'
                    })
                  ]
                }),
              ]
            }),

            b.namespace({
              id: 'B',
              name: 'something',
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
                    }),
                    b.documentEntity({
                      id: '#someMethod'
                    })
                  ]
                })
              ]
            })
          ]
        }, done);
      });

      describe('Namespace URIs', function() {
        it('should generate an @href for a namespace', function() {
          assert.equal(corpus.get('A').meta.href, '/A/index.html');
        });

        it('should use a pre-defined namespace @href', function() {
          assert.equal(corpus.get('B').meta.href, '/api.html');
        });
      });

      describe('Document URIs', function() {
        it('should generate an @href for every document within a namespace', function() {
          assert.equal(corpus.get('A/foo').meta.href, '/A/foo.html');
          assert.equal(corpus.get('B/foo').meta.href, '/api/foo.html');
        });

        it('should use /index.html for documents that nest other documents', function() {
          assert.equal(corpus.get('A/bar').meta.href, '/A/bar/index.html');
        });

        it('should discard /index.html from the documents that are nest within other documents', function() {
          assert.equal(corpus.get('A/bar.baz').meta.href, '/A/bar/baz.html');
        });
      });

      describe('DocumentEntity URIs', function() {
        it('should generate an @href for every document entity as a hashtag', function() {
          assert.equal(corpus.get('A/foo/someProp').meta.href, '/A/foo.html#A-foo-someProp');
          assert.equal(corpus.get('B/foo/someOtherProp').meta.href, '/api/foo.html#B-foo-someOtherProp');
          assert.equal(corpus.get('B/foo/#someMethod').meta.href, '/api/foo.html#B-foo-#someMethod');
        });
      });
    });

    context('when a nesting document clashes with a non-nested one', function() {
      beforeEach(function(done) {
        runWithConfig({
          database: [
            b.namespace({
              id: 'A',
              name: 'test',
              documents: [
                b.document({
                  id: 'c.html',
                  documents: [
                    b.document({
                      id: 'd'
                    })
                  ]
                }),

                b.document({
                  id: 'c',
                  documents: [
                    b.document({
                      id: 'd'
                    })
                  ]
                }),
              ]
            })
          ],
          emittedFileExtension: '.html'
        }, done);
      });

      it('links to container documents as "index.html"', function() {
        assert.equal(corpus.get('A/c.html').meta.href, '/A/c.html/index.html');
        assert.equal(corpus.get('A/c').meta.href, '/A/c/index.html');
      });
    });
  });
});
