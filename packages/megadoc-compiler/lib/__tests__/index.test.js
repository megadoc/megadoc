const path = require('path');
const R = require('ramda');
const { run: compile } = require('../compile');
const breakpoints = require('../breakpoints');
const { assert, createFileSuite, createSinonSuite } = require('megadoc-test-utils')

describe("megadoc-compiler::compile", function() {
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

  it('works', function(done) {
    compile({
      assetRoot: fileSuite.getRootDirectory(),
      sources: [{
        id: 'test-processor',
        include: fileSuite.join('lib/**/*.md'),
        processor: [ processorFile.path, {} ]
      }],
    }, {}, function(err, result) {
      if (err) {
        return done(err);
      }

      const { compilations } = result;

      assert.ok(Array.isArray(compilations));
      assert.equal(compilations.length, 1)

      done();
    });
  });

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

    compile(config, {}, function(err, state) {
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
      fileSuite.createFile('lib/a.md', `# New A`);

      compile(config, {
        watch: true,
        changedSources: [
          fileSuite.join('lib/a.md')
        ],
        initialState,
        purge: true
      }, function(mergeErr, nextState) {
        if (mergeErr) {
          return done(mergeErr);
        }

        const { compilations } = nextState;

        assert.calledOnce(parse);
        assert.calledWith(parse, sinon.match.any, fileSuite.join('lib/a.md'));

        assert.deepEqual(
          compilations[0].documents.map(x => x.properties.content),
          [ '# New A', '# B' ]
        )

        thirdRun(nextState);
      });
    }

    function thirdRun(initialState) {
      compile(config, {
        watch: true,
        changedSources: [],
        initialState,
        purge: true
      }, function(mergeErr, nextState) {
        if (mergeErr) {
          return done(mergeErr);
        }

        const { compilations } = nextState;

        assert.deepEqual(
          compilations[0].documents.map(x => x.properties.content),
          [ '# New A', '# B' ]
        )

        done();
      })
    }
  });

  it('works with multiple threads', function(done) {
    compile({
      assetRoot: fileSuite.getRootDirectory(),
      threads: 3,
      sources: [{
        id: 'test-processor',
        include: fileSuite.join('lib/**/*.md'),
        processor: [ processorFile.path, {} ]
      }],
    }, {}, function(err, { compilations }) {
      if (err) {
        return done(err);
      }

      assert.ok(Array.isArray(compilations));
      assert.equal(compilations.length, 1)

      done();
    });
  });

  it('respects breakpoints', function(done) {
    compile({
      assetRoot: fileSuite.getRootDirectory(),
      sources: [{
        id: 'test-processor',
        include: fileSuite.join('lib/**/*.md'),
        processor: [ processorFile.path, {} ]
      }],
    }, {
      breakpoint: breakpoints.BREAKPOINT_REFINE,
    }, function(err, compilation) {
      if (err) {
        return done(err);
      }

      assert.notOk(Array.isArray(compilation));
      assert.notOk(compilation.refinedDocuments)
      assert.ok(compilation.rawDocuments)

      done();
    });
  });

  describe('stages...', function() {
    const stages = [
      {
        message: 'can merge with a change tree',
        breakpoint: breakpoints.BREAKPOINT_MERGE_CHANGE_TREE + 1,
        output: 'rawDocuments',
        nextOutput: 'refinedDocuments',
      },

      {
        message: 'can parse',
        breakpoint: breakpoints.BREAKPOINT_PARSE + 1,
        output: 'rawDocuments',
        nextOutput: 'refinedDocuments',
      },
      {
        message: 'can refine',
        breakpoint: breakpoints.BREAKPOINT_REFINE + 1,
        output: 'refinedDocuments',
        nextOutput: 'documents',
      },
      {
        message: 'can reduce',
        breakpoint: breakpoints.BREAKPOINT_REDUCE + 1,
        output: 'documents',
        nextOutput: 'renderOperations',
      },
      {
        message: 'can render',
        breakpoint: breakpoints.BREAKPOINT_RENDER + 1,
        output: 'renderOperations',
        nextOutput: 'treeOperations',
      },
      {
        message: 'can reduce a tree',
        breakpoint: breakpoints.BREAKPOINT_REDUCE_TREE + 1,
        output: 'treeOperations',
        nextOutput: null,
      },
      {
        message: 'can compose a tree',
        breakpoint: breakpoints.BREAKPOINT_COMPOSE_TREE + 1,
        output: 'tree',
        nextOutput: 'corpus',
      },
      {
        message: 'can render the corpus',
        breakpoint: breakpoints.BREAKPOINT_SEAL + 1,
        output: null,
        nextOutput: null,
      },
      {
        message: 'can emit the assets',
        breakpoint: breakpoints.BREAKPOINT_EMIT_ASSETS + 1,
        output: null,
        nextOutput: null,
      },
    ];

    stages.forEach(function({ message, breakpoint, output, nextOutput, focus }) {
      const fn = focus ? it.only : it;

      fn(message, function(done) {
        const config = {
          assetRoot: fileSuite.getRootDirectory(),
          serializer: path.resolve(__dirname, 'fixtures/TestSerializer.js'),
          sources: [{
            id: 'test-processor',
            include: fileSuite.join('lib/**/*.md'),
            processor: [ processorFile.path, {} ]
          }],
        };

        compile(config, { breakpoint }, function(err, compilations) {
          if (err) {
            return done(err);
          }

          const compilation = Array.isArray(compilations) ?
            compilations[0] :
            compilations
          ;

          assert(!compilation[nextOutput],
            `"${nextOutput}" should not be present at this stage`
          )

          if (output) {
            assert(!!compilation[output],
              `"${output}" should be present at this stage`
            )
          }

          done();
        });
      })
    })
  })

  it('generates profiling benchmarks', function(done) {
    compile({
      assetRoot: fileSuite.getRootDirectory(),
      sources: [{
        id: 'test-processor',
        include: fileSuite.join('lib/**/*.md'),
        processor: [ processorFile.path, {} ]
      }],
    }, { profile: true }, function(err, { profile }) {
      if (err) {
        return done(err);
      }

      assert.ok(profile);
      assert.notEqual(profile.benchmarks.length, 0)

      done();
    });
  })

  it('selects only tagged compilations', function(done) {
    compile({
      assetRoot: fileSuite.getRootDirectory(),
      sources: [{
        id: 'untagged',
        include: fileSuite.join('lib/**/*.md'),
        processor: [ processorFile.path, {} ]
      }, {
        id: 'tagged--matching',
        tags: [ 'a' ],
        include: fileSuite.join('lib/**/a.md'),
        processor: processorFile.path
      }, {
        id: 'tagged--not-matching',
        tags: [ 'b' ],
        include: fileSuite.join('lib/**/b.md'),
        processor: processorFile.path,
      }],
    }, {
      includedTags: [ 'a' ]
    }, function(err, { compilations }) {
      if (err) {
        return done(err);
      }

      assert.equal(compilations.length, 1)
      assert.deepEqual(compilations.map(R.prop('id')), [ 'tagged--matching' ])

      done();
    });
  })
});