require('../../');

const Subject = require("../Corpus");
const { assert, createBuildersWithUIDs, createSinonSuite } = require('megadoc-test-utils');
const { NullLinter } = require('megadoc-linter');
const { NoConflicts, NoNamespaceConflicts } = require('../lintingRules');
const b = createBuildersWithUIDs(require('../../'));

describe('Corpus', function() {
  const sinon = createSinonSuite(this)
  let subject;

  beforeEach(function() {
    sinon.spy(NullLinter, 'logRuleEntry')
    sinon.spy(NullLinter, 'logError')

    subject = Subject({}, { linter: NullLinter });
  });

  it('works', function() {
  });

  it('lets me add a namespace', function() {
    var ns = b.namespace({
      id: 'JS',
      name: 'test-plugin',
      title: 'JavaScripts',
      documents: []
    });

    subject.add(ns);

    assert.equal(subject.at('JS'), ns);
  });

  it('tracks documents within a namespace', function() {
    var ns = b.namespace({
      id: 'JS',
      name: 'test-plugin',
      title: 'JavaScripts',
      documents: [
        b.document({
          id: 'Cache',
          entities: [],
        })
      ]
    });

    subject.add(ns);

    assert.equal(subject.at('JS'), ns);
    assert.equal(subject.at('JS/Cache'), ns.documents[0]);
  });

  it('allows me to customize the namespace symbol', function() {
    var ns = b.namespace({
      id: 'API',
      name: 'test-plugin',
      symbol: '::',
      title: 'Rails API',
      documents: [
        b.document({
          id: 'Users'
        })
      ]
    });

    subject.add(ns);

    assert.equal(subject.at('API'), ns);
    assert.equal(subject.at('API::Users'), ns.documents[0]);
  });

  it('borks if the namespace id is taken', function() {
    subject.add(b.namespace({ id: 'foo', name: 'test-plugin', }));
    subject.add(b.namespace({ id: 'foo', name: 'test-plugin', }));

    assert.calledWith(NullLinter.logRuleEntry, sinon.match({
      rule: NoNamespaceConflicts
    }))
  });

  it('borks if i try to add a non-namespace node without a parentNode', function() {
    subject.add(b.document({ id: 'foo' }));

    assert.calledWith(NullLinter.logError, sinon.match({
      message: `Unable to resolve parent document`
    }))
  });

  it('borks on duplicate UIDs', function() {
    subject.add(
      b.namespace({
        id: 'foo',
        name: 'test-plugin',
        documents: [
          b.document({ id: 'a' }),
          b.document({ id: 'a' }),
        ]
      }));

    assert.calledWith(NullLinter.logRuleEntry, sinon.match({
      rule: NoConflicts
    }))
  });

  describe('serialization', function() {
    it('flattens the database', function() {
      subject.add(b.namespace({
        id: 'API',
        name: 'test-plugin',
        documents: [
          b.document({
            id: 'Users',
            entities: [
              b.documentEntity({
                id: 'add'
              })
            ]
          })
        ]
      }));

      var dump = subject.toJSON();
      var get = path => (
        Object.keys(dump)
          .filter(x => dump[x].path === path || dump[x].uid === path)
          .map(x => dump[x])
          [0]
      )

      const getIdOf = path => get(path).uid;

      assert.equal(Object.keys(dump).length, 3);
      assert.equal(get('API').parentNodeUID, undefined,
        "it does not serialize the root corpus node"
      );

      assert.equal(get(get('API/Users').parentNodeUID).path, 'API');
      assert.equal(get('API/Users').entities[0], getIdOf('API/Users/add'),
        "it swaps entities with their UIDs"
      );

      assert.equal(get(get('API/Users/add').parentNodeUID).path, 'API/Users',
        "it swaps parentNode values with the UID"
      );
    });
  });

  describe('#visit', function() {
    it('lets me register a node visitor', function() {
      subject.add(b.namespace({ id: 'foo', name: 'test-plugin', }));

      subject.traverse({
        Namespace: function(node) {
          node.href = 'hadouken';
        }
      });

      assert.equal(subject.at('foo').href, 'hadouken');
    });

    it('calls a visitor that was registered for a parent type', function() {
      var called = false;
      var nodeType;

      subject.add(
        b.namespace({
          id: 'foo',
          name: 'test-plugin',
          documents: [ b.document({ id: 'bar' }) ]
        })
      );

      subject.traverse({
        Node: function(node) {
          called = true;
          nodeType = node.type;
        }
      });

      assert.ok(called);
      assert.equal(nodeType, 'Document');
    });

    // we can't really test this anymore ever since we removed "parentNode" from
    // the definition of Node; there's no way to instantiate Nodes anymore which
    // _kind-of_ conforms to this spec.
    it.skip('does not call a visitor that was registered for a child type', function() {
      var called = false;

      subject.add(
        b.namespace({
          id: 'foo',
          name: 'test-plugin',
          documents: [
            b.node({
              id: 'bar'
            })
          ]
        })
      );

      subject.traverse({
        Document: function() {
          called = true;
        }
      });

      assert.notOk(called);
    });

    it('does not call a visitor that was registered for a sibling type', function() {
      var callCount = 0;
      var callTypes = [];

      subject.add(
        b.namespace({
          id: 'foo',
          name: 'test-plugin',
          documents: [
            b.document({
              id: 'bar',
              entities: [
                b.documentEntity({
                  id: 'baz'
                })
              ]
            })
          ]
        })
      );

      subject.traverse({
        DocumentEntity: function(node) {
          callCount += 1;
          callTypes.push(node.type);
        }
      });

      assert.equal(callCount, 1);
      assert.deepEqual(callTypes, [ "DocumentEntity" ]);
    });

    it('rejects visitors for unknown node types', function() {
      assert.throws(function() {
        subject.traverse({
          Foobar: function() {
          }
        });
      }, "ArgumentError: a visitor was defined for an unknown node type 'Foobar'.")
    });
  });
});