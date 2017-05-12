const Subject = require('../ClassBrowser');
const reactSuite = require('test_helpers/reactSuite');
const stubRoutingContext = require('test_helpers/stubRoutingContext');
const { assert } = require('chai');
const { drill, m } = require('react-drill');
const Link = require('components/Link');

describe('JS::Components::ClassBrowser', function() {
  const suite = reactSuite(this, stubRoutingContext(Subject), {
    namespaceNode: {
      config: {},
      documents: [
        {
          uid: 'Cache',
          title: 'Cache',
          meta: {
            href: '/Cache.html',
          },
          documents: [],
          entities: [
            {
              uid: '#add',
              meta: {
                href: '/Cache.html##add',
              },
              properties: {
                name: '#add'
              }
            }
          ],
          properties: {
            name: 'Localized Cache Name',
            tags: []
          },
        },
        {
          uid: 'CarBumper',
          title: 'CarBumper',
          meta: {
            href: '/CarBumper.html',
          },
          documents: [],
          entities: [],
          properties: {
            name: 'Localized CarBumper Name',
            tags: [{
              type: 'protected'
            }]
          },
        }
      ]
    }
  });

  it('renders', function() {
    assert.ok(subject.isMounted());
  });

  it('links to modules using their short-names', function() {
    drill(subject).find(Link, m.hasText('Localized Cache Name'));
    drill(subject).find(Link, m.hasText('Localized CarBumper Name'));
  });

  context('given an active module document...', function() {
    beforeEach(function() {
      suite.setProps({
        documentNode: subject.props.namespaceNode.documents[0]
      });
    });

    it('renders links to its entities', function() {
      drill(subject).find(Link, m.hasText('#add'))
    });
  });
});
