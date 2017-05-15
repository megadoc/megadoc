const render = require('../render');
const FileSuite = require('megadoc-test-utils/FileSuite');

describe.skip('megadoc-html-serializer::render', function() {
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

    // defaultAssets = {
    //   pluginScripts: [],
    //   runtimeConfigs: [],
    // };

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
    done();
  })
});