const path = require('path');
const Compiler = require("../Compiler");
const { run: compile } = Compiler;
const { assert, createFileSuite, createSinonSuite } = require('megadoc-test-utils')

describe("megadoc-compiler::Compiler", function() {
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
    }, function(err, { compilations }) {
      if (err) {
        return done(err);
      }

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
          [ '# B', '# New A' ]
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
          [ '# B', '# New A' ]
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
    }, function(err, { compilations }) {
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
      breakpoint: Compiler.BREAKPOINT_REFINE,
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
        message: 'can parse',
        breakpoint: Compiler.BREAKPOINT_REFINE,
        output: 'rawDocuments',
        nextOutput: 'refinedDocuments',
        // focus: true ,
      },
      {
        message: 'can refine',
        breakpoint: Compiler.BREAKPOINT_REDUCE,
        output: 'refinedDocuments',
        nextOutput: 'documents',
      },
      {
        message: 'can reduce',
        breakpoint: Compiler.BREAKPOINT_RENDER,
        output: 'documents',
        nextOutput: 'renderOperations',
      },
      {
        message: 'can render',
        breakpoint: Compiler.BREAKPOINT_REDUCE_TREE,
        output: 'renderOperations',
        nextOutput: 'treeOperations',
      },
      {
        message: 'can reduce a tree',
        breakpoint: Compiler.BREAKPOINT_MERGE_CHANGE_TREE,
        output: 'treeOperations',
        nextOutput: null,
      },
      {
        message: 'can merge with a change tree',
        breakpoint: Compiler.BREAKPOINT_COMPOSE_TREE,
        output: 'treeOperations',
        nextOutput: 'tree',
      },
      {
        message: 'can compose a tree',
        breakpoint: Compiler.BREAKPOINT_RENDER_CORPUS,
        output: 'tree',
        nextOutput: 'corpus',
      },
      {
        message: 'can render the corpus',
        breakpoint: Compiler.BREAKPOINT_EMIT_ASSETS,
        output: null,
        nextOutput: null,
      },
      {
        message: 'can emit the assets',
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

          assert.notOk(compilation[nextOutput])

          if (output) {
            assert.ok(compilation[output])
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
    }, { profile: true }, function(err, profile) {
      if (err) {
        return done(err);
      }

      assert.ok(profile);
      assert.notEqual(profile.benchmarks.length, 0)

      done();
    });
  })
});