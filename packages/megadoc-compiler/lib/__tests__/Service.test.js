const Subject = require('../Service');
const { assert } = require('megadoc-test-utils');

describe('megadoc-compiler::Service', function() {
  const calls = [];
  const preset = {
    NULL_SERVICE: (params, { name }) => {
      return {
        up(callback) {
          calls.push(`up:${name}`);
          callback();
        },

        down(callback) {
          calls.push(`down:${name}`);
          callback();
        }
      }
    }
  };

  const state = {
    compilations: [
      {
        decorators: [
          {
            services: [
              {
                name: 'null-service',
                type: 'NULL_SERVICE',
              }
            ]
          },
        ]
      }, // compilations[0]
      {
        decorators: [
          {
            services: [
              {
                name: 'null-service',
                type: 'NULL_SERVICE',
              }, // deduped

              {
                name: 'other-service',
                type: 'NULL_SERVICE',
              }
            ]
          },
          {

          } // decorator with no services
        ]
      }, // compilations[1]
    ]
  };

  beforeEach(() => {
    calls.splice(0);
  });

  describe('.start', function() {
    let services;

    beforeEach(function() {
      services = Subject.start(preset, state);
    });

    it('collects services from decorators', function() {});

    it('dedupes and starts services', function(done) {
      services.up(function(err) {
        if (err) {
          done(err);
        }
        else {
          assert.deepEqual(calls, ['up:null-service', 'up:other-service']);

          done();
        }
      });
    });

    it('stops services', function(done) {
      services.down(function(err) {
        if (err) {
          done(err);
        }
        else {
          assert.deepEqual(calls, ['down:null-service', 'down:other-service']);

          done();
        }
      });
    });
  });
});