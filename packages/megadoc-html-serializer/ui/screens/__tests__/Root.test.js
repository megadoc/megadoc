const Subject = require('../Root');
const AppState = require('../../AppState');
const DocumentURI = require('../../DocumentURI');
const DocumentResolver = require('../../DocumentResolver');
const {
  assert,
  reactSuite,
  stubAppContext,
  stubRoutingContext,
  createCorpus,
} = require('test_helpers');

describe('megadoc::Components::Root', function() {
  const suite = reactSuite(this, stubAppContext(stubRoutingContext(Subject)), () => {
    const config = {
      redirect: {},
    };

    const documentURI = new DocumentURI({});
    const corpus = createCorpus({
      database: require('json!test_helpers/fixtures/corpus.json'),
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