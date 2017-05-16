const HTMLSerializer = require('../');
const FileSuite = require('megadoc-test-utils/FileSuite');

describe('HTMLSerializer', function() {
  const fileSuite = FileSuite(this);

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
});