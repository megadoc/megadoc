const Subject = require('../Root');
const reactSuite = require('test_helpers/reactSuite');
const { assert } = require('chai');
const AppState = require('core/AppState');
const DocumentURI = require('core/DocumentURI');
const DocumentResolver = require('../../DocumentResolver');
const CorpusAPI = require('core/CorpusAPI');
const stubAppContext = require('test_helpers/stubAppContext');
const stubRoutingContext = require('test_helpers/stubRoutingContext');

describe('megadoc::Components::Root', function() {
  const suite = reactSuite(this, stubAppContext(stubRoutingContext(Subject)), () => {
    const config = {
      redirect: {}
    };

    const documentURI = new DocumentURI({});
    const corpus = CorpusAPI({
      database: require('json!test_helpers/fixtures/corpus--small.json'),
      redirect: config.redirect
    });

    return {
      config,
      corpus,
      documentURI,
      documentResolver: new DocumentResolver({
        config,
        corpus,
        documentURI,
      }),
      appState: AppState({}),
      onNavigate: Function.prototype,
      location: {
        pathname: '/api/foo.html',
        protocol: 'http:',
        origin: 'http://localhost',
        hash: ''
      }
    }
  });

  it('renders', function() {
    assert.ok(suite.getSubject().isMounted());
  });
});