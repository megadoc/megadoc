const cp = require('child_process');
const fs = require('fs');
const Subject = require('../shell');
const { assert, createFileSuite, stubConsoleWarn, neutralizeWhitespace } = require('megadoc-test-utils');

describe('megadoc-compiler::services::shell', function() {
  const fileSuite = createFileSuite(this);
  const createScript = contents => {
    const script = fileSuite.createFile(null, neutralizeWhitespace(contents));
    cp.execSync(`chmod +x "${script.path}"`);
    return script;
  };

  let service;

  const params = {
    compilerOptions: { verbose: false }
  }

  afterEach(function(callback) {
    if (service) {
      service.down(callback);
    }
    else {
      callback();
    }
  });

  describe('.up', function() {
    it('starts when the command emits "READY" to stdout', function(done) {
      const script = createScript(`
        #!/bin/sh

        echo "READY"
      `);

      service = Subject(params, {
        name: 'foo',
        up: {
          command: script.path,
        },
        down: {
          signal: 'SIGTERM'
        }
      });

      service.up(done);
    });

    it('passes arguments', function(done) {
      const output = fileSuite.createFile(null, '');
      const script = createScript(`
        #!/bin/sh

        echo "found" >> "$1"
        echo "READY"
      `);

      service = Subject(params, {
        name: 'foo',
        up: {
          command: script.path,
          args: [ output.path ],
        },
        down: {
          signal: 'SIGTERM'
        }
      });

      service.up(function(err) {
        if (err) {
          done(err);
        }
        else {
          assert.equal(fs.readFileSync(output.path, 'utf8'), 'found\n');
          done();
        }
      });
    });

    it('exports environment variables', function(done) {
      const output = fileSuite.createFile(null, '');
      const script = createScript(`
        #!/bin/sh

        echo "$\{PORT}" >> "$1"
        echo "READY"
      `);

      service = Subject(params, {
        name: 'foo',
        up: {
          command: script.path,
          args: [ output.path ],
          env: {
            PORT: 17654
          }
        },
        down: {
          signal: 'SIGTERM'
        }
      });

      service.up(function(err) {
        if (err) {
          done(err);
        }
        else {
          assert.equal(fs.readFileSync(output.path, 'utf8'), '17654\n');
          done();
        }
      });
    });

    it('reports boot errors', function(done) {
      stubConsoleWarn(`exited abnormally`);

      const script = createScript(`
        #!/bin/sh

        exit 1
        echo "READY"
      `);

      service = Subject(params, {
        name: 'foo',
        up: {
          command: script.path,
        },
        down: {
          signal: 'SIGTERM'
        }
      });

      service.up(function(err) {
        if (!err) {
          done('Should have failed!')
        }
        else {
          done();
        }
      });
    })

    it('reports errors due to a bad script', function(done) {
      service = Subject(params, {
        name: 'foo',
        up: {
          command: 'something-that-does-not-exist',
        },
        down: {
          signal: 'SIGTERM'
        }
      });

      service.up(function(err) {
        if (!err) {
          done('Should have failed!')
        }
        else {
          done();
        }
      });
    })

    it('times out if script takes too long to start', function(done) {
      const script = createScript(`
        #!/bin/sh

        sleep 2

        echo "READY"
      `);

      service = Subject({
        compilerOptions: params.compilerOptions,
        timeout: 10
      }, {
        name: 'foo',
        up: {
          command: script.path,
        },
        down: {
          signal: 'SIGTERM'
        }
      });

      service.up(function(err) {
        if (!err) {
          done('Should have failed!')
        }
        else {
          done();
        }
      });
    })
  })
});