const path = require('path');
const Compiler = require("../Compiler");
const { run: compile } = Compiler;
const { assert, createFileSuite } = require('megadoc-test-utils')

describe("megadoc-compiler::Compiler", function() {
  const fileSuite = createFileSuite(this);
  let processorFile;

  beforeEach(function() {
    fileSuite.createFile('lib/test.md', `
      # Hello World!
    `);

    const parseFnFile = fileSuite.createFile('processor/parseFn.js', `
      module.exports = function parse(options, filePath, done) {
        done(null, { id: "1" });
      };
    `);

    const reduceFnFile = fileSuite.createFile('processor/reduceFn.js', `
      const { builders: b } = require('megadoc-corpus');

      module.exports = function reduce(options, actions, rawDocument, done) {
        const document = b.document({
          id: rawDocument.id
        });

        done(null, document);
      };
    `);

    processorFile = fileSuite.createFile('processor/index.js', `
      exports.name = 'test-processor';
      exports.parseFnPath = "${parseFnFile.path}";
      exports.reduceFnPath = "${reduceFnFile.path}";
    `);
  })

  it('works', function(done) {
    compile({
      assetRoot: fileSuite.getRootDirectory(),
      sources: [{
        id: 'test-processor',
        include: fileSuite.join('lib/**/*.md'),
        processor: [ processorFile.path, {} ]
      }],
    }, function(err, compilations) {
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
});