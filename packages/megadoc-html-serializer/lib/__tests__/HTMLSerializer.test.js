const HTMLSerializer = require('../');
const { assert, createFileSuite, createBuildersWithUIDs } = require('megadoc-test-utils');
const b = createBuildersWithUIDs(require('megadoc-corpus'));

describe('HTMLSerializer', function() {
  const fileSuite = createFileSuite(this);

  let subject, defaultConfig/*, defaultAssets*/;

  beforeEach(function() {
    const defaultHtmlFile = fileSuite.createFile('index.html', `
      <html>
      </html>
    `);

    defaultConfig = {
      htmlFile: defaultHtmlFile.path,
    };
  });

  describe('.renderOne', function() {
    it('extracts a summary from one of the "summaryFields" fields', function() {
      subject = new HTMLSerializer(defaultConfig);

      const node = b.document({
        id: 'moduleA',
        summaryFields: [ 'description' ],
        properties: {
          text: 'Hello *World*!',
          description: 'lol!'
        }
      })

      const renderedNode = subject.renderOne(node);

      assert.equal(renderedNode.summary, 'lol!')
    })
  })

  describe('starting / stopping', function() {
    afterEach(function(done) {
      if (subject) {
        subject.stop(done);
      }
      else {
        done();
      }
    });

    it('creates a jsdom environment', function(done) {
      subject = new HTMLSerializer(defaultConfig);

      subject.start([], function(err/*, ok*/) {
        if (err) {
          done(err);
        }
        else {
          done();
        }
      })
    })
  })
});