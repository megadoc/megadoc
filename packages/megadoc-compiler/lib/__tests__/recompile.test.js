const compile = require('../compile');
const R = require('ramda');
const { assert, createFileSuite, createSinonSuite } = require('megadoc-test-utils')

describe('megadoc-compiler::recompile', function() {
  const fileSuite = createFileSuite(this);
  let processorFile;

  beforeEach(function() {
    fileSuite.createFile('lib/a.md', `# A`);
    fileSuite.createFile('lib/b.md', `# B`);

    const parseFnFile = fileSuite.createFile('processor/parseFn.js', `
      const fs = require('fs')

      module.exports = function() {
        module.exports.__impl__.apply(null, arguments);
      }

      module.exports.__impl__ = function parse(options, filePath, done) {
        done(null, { id: "1", filePath, content: fs.readFileSync(filePath, 'utf8') });
      };
    `);

    const reduceFnFile = fileSuite.createFile('processor/reduceFn.js', `
      const { builders: b } = require('megadoc-corpus');

      module.exports = function reduce(options, rawDocument, done) {

        done(null, b.document({
          id: rawDocument.id,
          filePath: rawDocument.filePath,
          properties: {
            content: rawDocument.content
          }
        }));
      };
    `);

    processorFile = fileSuite.createFile('processor/index.js', `
      exports.name = 'test-processor';
      exports.parseFnPath = "${parseFnFile.path}";
      exports.reduceFnPath = "${reduceFnFile.path}";
    `);
  })

  const sinon = createSinonSuite(this)

  it('works with a previous compilation', function(done) {
    fileSuite.createFile('lib/a.js', `console.log("A");`);

    const parser = require(fileSuite.join('processor/parseFn.js'))
    const parse = sinon.spy(parser, '__impl__')
    const config = {
      assetRoot: fileSuite.getRootDirectory(),
      sources: [
        {
          id: 'test-processor',
          include: fileSuite.join('lib/**/*.md'),
          processor: [ processorFile.path, {} ]
        },
        {
          id: 'other-test-processor',
          include: fileSuite.join('lib/**/*.js'),
          processor: [ processorFile.path, {} ]
        }
      ],
    }

    compile(config, function(err, state) {
      if (err) {
        return done(err);
      }

      const { compilations } = state;

      assert.ok(Array.isArray(compilations));
      assert.equal(compilations.length, 2)

      assert.calledWith(parse, sinon.match.any, fileSuite.join('lib/a.md'));
      assert.calledWith(parse, sinon.match.any, fileSuite.join('lib/b.md'));

      assert.deepEqual(
        compilations[0].documents.map(x => x.properties.content),
        [ '# A', '# B' ]
      )

      parse.reset();

      assert.notCalled(parse);

      secondRun(state)
    });

    function secondRun(initialState) {
      compile(config, {
        watch: true,
        changedSources: [],
        initialState,
        purge: true
      }, function(mergeErr, nextState) {
        if (mergeErr) {
          return done(mergeErr);
        }

        const pickProcessedProperties = R.pick([
          'documents',
          'renderOperations',
          'treeOperations',
        ])

        assert.deepEqual(
          initialState.compilations.map(pickProcessedProperties),
          nextState.compilations.map(pickProcessedProperties)
        )

        done();
      })
    }
  });
});