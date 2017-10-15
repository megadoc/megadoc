const path = require('path');
const { execSync } = require('child_process')
const { assert, createIntegrationSuite } = require('megadoc-test-utils');

describe('megadoc-git-stats [integration]', function() {
  const suite = createIntegrationSuite(this);

  let repoPath

  beforeEach(function() {
    repoPath = path.join(suite.root, 'git')

    execSync(`
      mkdir -p ${repoPath}                      && \\
      cd ${repoPath}                            && \\
      git init .                                && \\
      git config user.name "Ahmad Amireh"       && \\
      git config user.email "ahmad@amireh.net"  && \\
      echo "test" > README1.md                  && \\
      echo "test" > README2.md                  && \\
      echo "test" > README3.md                  && \\
      echo "test" > README4.md                  && \\
      git add .                                 && \\
      git commit -am 'initial commit'           && \\
      echo "another test" >> README1.md         && \\
      git commit -am 'second commit'
    `, { stdio: 'ignore' })
  })

  it('works', function(done) {
    suite.compile({
      assetRoot: repoPath,
      sources: [
        {
          include: [ repoPath + '/*' ],
          exclude: [ '**/README4.md' ],
          processor: {
            name: 'megadoc-plugin-markdown',
          },
          decorators: [
            [ require.resolve('../index.js'), {} ],
          ]
        },
        {
          id: 'weeh',
          include: [ repoPath + '/README4.md' ],
          processor: {
            name: 'megadoc-plugin-markdown',
          },
        },
      ]
    }, {}, function(err, state) {
      if (err) {
        done(err)
      }
      else {
        const { compilations } = state

        assert.equal(compilations[0].documents[0].id, 'readme1')
        assert.include(Object.keys(compilations[0].documents[0].meta), 'git')
        assert.include(Object.keys(compilations[0].documents[0].meta.git), 'updated_at')
        assert.include(Object.keys(compilations[0].documents[0].meta.git), 'authors')
        assert.equal(compilations[0].documents[0].meta.git.authors.length, 1)
        assert.deepEqual(compilations[0].documents[0].meta.git.authors[0], {
          c: 2,
          n: 'Ahmad Amireh',
          e: 'ahmad@amireh.net'
        })

        assert.deepEqual(compilations[1].documents[0].meta.git, undefined)

        done();
      }
    })
  });
})