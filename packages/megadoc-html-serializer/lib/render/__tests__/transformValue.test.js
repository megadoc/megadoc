const { assert } = require('megadoc-test-utils');
const subject = require('../transformValue');
const useNext = (a,b) => b;

describe('megadoc-compiler::utils::transformValue', function() {
  it('should transform primitives', function() {
    const nextValue = subject('bar', 'baz', useNext)

    assert.deepEqual(nextValue, 'baz');
  });

  describe('objects...', function() {
    it('should transform each described property of an object', function() {
      const nextValue = subject({
        name: 'foo',
      }, {
        name: 'bar'
      }, useNext)

      assert.deepEqual(nextValue, { name: 'bar' });
    });

    it('should leave undescribed properties of an object untouched', function() {
      const nextValue = subject({
        name: 'foo',
      }, {}, useNext)

      assert.deepEqual(nextValue, { name: 'foo' });
    })

    it('should not confuse RegExp-s for iterable objects', function() {
      const nextValue = subject({
        name: /foo/,
      }, {
        name: /bar/
      }, useNext)

      assert.deepEqual(nextValue, { name: /bar/ });
    })

    it('should add a new proprerty', function() {
      const nextValue = subject({
      }, {
        name: 'foo',
      }, useNext)

      assert.deepEqual(nextValue, { name: 'foo' });
    });

    it('should not confuse mixed types', function() {
      const nextValue = subject({
        name: 'foo',
      }, {
        name: {
          text: 'foo',
          html: '<a>foo</a>',
        }
      }, useNext)

      assert.deepEqual(nextValue, {
        name: {
          text: 'foo',
          html: '<a>foo</a>',
        }
      });
    })

    it('works with a real thing...', function() {
      const sourceValue = {
        "aliases": [],
        "description": "Close the connection to the server.",
        "filePath": "lib/transport/binary/index.js",
        "id": "Transports.Binary.BinaryTransport#Transports.Binary.close",
        "isModule": false,
        "loc": {
          "start": {
            "line": 314,
            "column": 0
          },
          "end": {
            "line": 318,
            "column": 2
          }
        },
        "line": 314,
        "mixinTargets": [],
        "name": "close",
        "namespace": "Transports.Binary",
        "nodeInfo": {
          "type": "Function",
          "scope": "prototype",
          "params": []
        },
        "receiver": "Transports.Binary.BinaryTransport",
        "symbol": "#",
        "tags": [
          {
            "type": "return",
            "string": "disconnected transport instance",
            "typeInfo": {
              "description": "the disconnected transport instance",
              "type": {
                "name": "BinaryTransport"
              }
            },
            "line": 314
          }
        ],
        "type": "Function"
      }

      const descriptor = {
        "aliases": [],
        "description": {
          "$__type": "CONVER_MARKDOWN_TO_HTML",
          "$__value": {
            "$__type": "LINKIFY_STRING",
            "$__value": {
              "text": "Close the connection to the server."
            }
          }
        },
        "filePath": "lib/transport/binary/index.js",
        "id": "Transports.Binary.BinaryTransport#Transports.Binary.close",
        "isModule": false,
        "loc": {
          "start": {
            "line": 314,
            "column": 0
          },
          "end": {
            "line": 318,
            "column": 2
          }
        },
        "line": 314,
        "mixinTargets": [],
        "name": "close",
        "namespace": "Transports.Binary",
        "nodeInfo": {
          "type": "Function",
          "scope": "prototype",
          "params": []
        },
        "receiver": "Transports.Binary.BinaryTransport",
        "symbol": "#",
        "tags": [
          {
            "type": "return",
            "string": "disconnected transport instance",
            "typeInfo": {
              "description": {
                "$__type": "CONVER_MARKDOWN_TO_HTML",
                "$__value": {
                  "$__type": "LINKIFY_STRING",
                  "$__value": {
                    "text": "the disconnected transport instance"
                  }
                }
              },
              "type": {
                "name": "BinaryTransport",
                "html": {
                  "$__type": "LINKIFY_FRAGMENT",
                  "$__value": {
                    "text": "BinaryTransport",
                    "format": "html"
                  }
                }
              }
            },
            "line": 314
          }
        ],
        "type": "Function"
      }

      const nextValue = subject(sourceValue, descriptor, useNext)

      assert.deepEqual(nextValue, descriptor);
    });
  });

  describe('arrays...', function() {
    it('should transform each item of a list', function() {
      const nextValue = subject({
        items: [ 'a', 'b' ],
      }, {
        items: [ 'a', 'c' ],
      }, useNext)

      assert.deepEqual(nextValue.items, [ 'a', 'c' ]);
    });

    it('should use a new list', function() {
      const nextValue = subject({
      }, {
        items: [ 'a', 'c' ],
      }, useNext)

      assert.deepEqual(nextValue.items, [ 'a', 'c' ]);
    });
  });
});