require('../../');

var Subject = require("../Corpus");
var b = require('../CorpusTypes').builders;
var assert = require('chai').assert;

describe('Corpus', function() {
  var subject;

  beforeEach(function() {
    subject = Subject();
  });

  it('works', function() {
  });

  it('lets me add a namespace', function() {
    var ns = b.namespace({
      id: 'JS',
      corpusContext: 'JavaScripts',
      documents: []
    });

    subject.add(ns);

    assert.equal(subject.get('JS'), ns);
  });

  it('tracks documents within a namespace', function() {
    var ns = b.namespace({
      id: 'JS',
      corpusContext: 'JavaScripts',
      documents: [
        b.document({
          id: 'Cache',
          entities: [],
        })
      ]
    });

    subject.add(ns);

    assert.equal(subject.get('JS'), ns);
    assert.equal(subject.get('JS/Cache'), ns.documents[0]);
  });

  it('allows me to customize the namespace symbol', function() {
    var ns = b.namespace({
      id: 'API',
      symbol: '::',
      corpusContext: 'Rails API',
      documents: [
        b.document({
          id: 'Users'
        })
      ]
    });

    subject.add(ns);

    assert.equal(subject.get('API'), ns);
    assert.equal(subject.get('API::Users'), ns.documents[0]);
  });

  it('borks if the namespace id is taken', function() {
    subject.add(b.namespace({ id: 'foo' }));

    assert.throws(function() {
      subject.add(b.namespace({ id: 'foo' }));
    }, "IntegrityViolation: a namespace with the id 'foo' already exists.");
  });

  it('borks if i try to add a non-namespace node without a parentNode', function() {
    assert.throws(function() {
      subject.add(b.document({ id: 'foo' }));
    }, "IntegrityViolation: expected node to reference a parentNode.");
  });

  describe('serialization', function() {
    it('flattens the database', function() {
      subject.add(b.namespace({
        id: 'API',
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

      assert.equal(Object.keys(dump).length, 3);
      assert.equal(dump['API'].parentNode, undefined,
        "it does not serialize the root corpus node"
      );

      assert.equal(dump['API/Users'].parentNode, 'API');
      assert.equal(dump['API/Users'].entities[0], 'API/Users/add',
        "it swaps entities with their UIDs"
      );

      assert.equal(dump['API/Users/add'].parentNode, 'API/Users',
        "it swaps parentNode values with the UID"
      );
    });
  });

  describe('#visit', function() {
    it('lets me register a node visitor', function() {
      subject.visit({
        Namespace: function(node) {
          node.href = 'hadouken';
        }
      });

      subject.add(b.namespace({ id: 'foo' }));
      assert.equal(subject.get('foo').href, 'hadouken');
    });

    it('calls a visitor that was registered for a parent type', function() {
      var called = false;
      var nodeType;

      subject.visit({
        Node: function(node) {
          called = true;
          nodeType = node.type;
        }
      });

      subject.add(
        b.namespace({ id: 'foo',
          documents: [ b.document({ id: 'bar' }) ]
        })
      );

      assert.ok(called);
      assert.equal(nodeType, 'Document');
    });

    it('does not call a visitor that was registered for a child type', function() {
      var called = false;

      subject.visit({
        Document: function() {
          called = true;
        }
      });

      subject.add(
        b.namespace({
          id: 'foo',
          documents: [
            b.node({
              id: 'bar'
            })
          ]
        })
      );

      assert.notOk(called);
    });

    it('does not call a visitor that was registered for a sibling type', function() {
      var callCount = 0;
      var callTypes = [];

      subject.visit({
        DocumentEntity: function(node) {
          callCount += 1;
          callTypes.push(node.type);
        }
      });

      subject.add(
        b.namespace({
          id: 'foo',
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

      assert.equal(callCount, 1);
      assert.deepEqual(callTypes, [ "DocumentEntity" ]);
    });

    it('rejects visitors for unknown node types', function() {
      assert.throws(function() {
        subject.visit({
          Foobar: function() {
          }
        });
      }, "ArgumentError: a visitor was defined for an unknown node type 'Foobar'.")
    });
  });
});