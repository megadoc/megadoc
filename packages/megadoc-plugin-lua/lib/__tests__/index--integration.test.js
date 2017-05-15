const path = require('path');
const { createIntegrationSuite } = require('megadoc-test-utils');

describe('[integration] megadoc-plugin-lua', function() {
  const integrationSuite = createIntegrationSuite(this);

  it('works', function(done) {
    const sourceFile = integrationSuite.createFile('cli.lua', `
      --- @module cli
      --- This here be our CLI module.
      local cli = {}

      --- Ahhh!
      cli.foo = function() end

      return cli
    `);

    integrationSuite.compile({
      sources: [
        {
          id: 'lua',
          include: [
            `${path.dirname(sourceFile.path)}/*.lua`
          ],
          processor: {
            name: path.resolve(__dirname, '../index.js'),
            options: {
              id: 'lua',
              name: 'Lua',
            }
          }
        }
      ]
    }, function(err) {
      if (err) {
        done(err);
      }
      else {
        integrationSuite.assertFileWasRendered('lua/cli.html');
        done();
      }
    })
  });
});