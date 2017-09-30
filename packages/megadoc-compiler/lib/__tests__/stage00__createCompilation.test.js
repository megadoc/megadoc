const { assert, createFileSuite } = require('megadoc-test-utils');
const path = require('path');
const subject = require('../stage00__createCompilation');

describe('stage00__createCompilation', function() {
  const fileSuite = createFileSuite(this);

  let processorSpec, decoratorSpec, output;

  beforeEach(function() {
    fileSuite.createFile('sources/a.js');
    fileSuite.createFile('sources/b.md');

    processorSpec = fileSuite.createFile('parse.js', `
      const path = require('path');

      module.exports = {
        parseFnPath: path.resolve(__dirname, './parseFn.js'),
        reduceFnPath: path.resolve(__dirname, './reduceFn.js'),
      };
    `);

    decoratorSpec = fileSuite.createFile('decorator.js', `
      module.exports = {
        name: 'megadoc-test-decorator',
        configureFn: options => Object.assign({ defaultOption: true }, options)
      };
    `);

    output = subject([ 'publicOption' ], {
      config: {
        publicOption: 1,
        privateOption: 2,
        assetRoot: fileSuite.getRootDirectory()
      },
      runOptions: {},
    }, {
      include: [
        'sources/**/*.js',
      ],
      processor: {
        name: processorSpec.path,
        options: {
          foo: 'bar'
        }
      },
      decorators: [
        {
          name: decoratorSpec.path,
          options: {
            bar: 'baz'
          }
        }
      ]
    });
  });

  it('should include the matching files', function() {
    assert.equal(output.files.length, 1);
  });

  it('should extract the function paths', function() {
    assert.equal(output.processor.parseFnPath,
      path.join(path.dirname(processorSpec.path), 'parseFn.js')
    );
  });

  it('should expose the public compiler options', function() {
    assert.equal(output.compilerOptions.publicOption, 1);
  });

  it('should not expose private compiler options', function() {
    assert.equal(output.compilerOptions.privateOption, undefined);
  });

  it('should store the processor options', function() {
    assert.deepEqual(output.processorOptions, { foo: 'bar' });
  });

  context('given a pair of processor config', function() {
    beforeEach(function() {
      output = subject([], {
        config: { commonOption: 1 },
        runOptions: {},
      },
        {
          pattern: /\.js$/,
          include: [
            path.join(fileSuite.getRootDirectory(), 'sources'),
          ],
          processor: [processorSpec.path, {
            foo: 'bar'
          }]
        }
      );
    });

    it('should store the processor options', function() {
      assert.deepEqual(output.processorOptions, { foo: 'bar' });
    });
  })

  it('should create decorators', function() {
    assert.deepEqual(output.decorators.length, 1)
    assert.deepEqual(output.decorators[0].name, 'megadoc-test-decorator')
    assert.include(output.decorators[0].options, {
      defaultOption: true
    }, 'it invokes the decorator configureFn')

    assert.include(output.decorators[0].options, {
      bar: 'baz'
    }, 'it passes the user options')
  })
});