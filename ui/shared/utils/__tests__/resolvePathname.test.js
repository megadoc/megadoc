const Subject = require("../resolvePathname");
const { assert } = require('chai');

describe("megadoc::utils::resolvePathname", function() {
  [
    // depth = 0
    [ '/index.html', '/foo.html', 'foo.html' ],
    [ '/index.html', '/foo/index.html', 'foo/index.html' ],

    // depth = 1, parent
    [ '/foo/index.html', '/index.html', '../index.html' ],

    // depth = 1, sibling
    [ '/foo/index.html', '/foo/bar.html', 'bar.html' ],

    // depth = 1, child
    [ '/foo/index.html', '/foo/bar/index.html', 'bar/index.html' ],

    // // depth = 1, grand-child
    [ '/foo/index.html', '/foo/bar/baz/index.html', 'bar/baz/index.html' ],

    // depth = 1, uncle
    [ '/foo/index.html', '/bar/index.html', '../bar/index.html' ],

    // depth = 2, sibling
    [ '/foo/bar/index.html', '/foo/bar/baz.html', 'baz.html' ],

    // depth = 2, parent
    [ '/foo/bar/index.html', '/foo/index.html', '../index.html' ],

    // depth = 2, child
    [ '/foo/bar/index.html', '/foo/bar/baz/index.html', 'baz/index.html' ],

    // depth = 2, grand-child
    [ '/foo/bar/index.html', '/foo/bar/baz/hax/index.html', 'baz/hax/index.html' ],

    // depth = 2, root
    [ '/foo/bar/index.html', '/index.html', '../../index.html' ],

    [ '/api.html', '/api/DB.html', 'api/DB.html' ],

    // depth=3
    [ '/foo/bar/baz/index.html', '/foo/bar/baz/a.html', 'a.html' ],
    [ '/foo/bar/baz/index.html', '/foo/bar/index.html', '../index.html' ],
    [ '/foo/bar/baz/index.html', '/foo/index.html', '../../index.html' ],
    [ '/foo/bar/baz/index.html', '/index.html', '../../../index.html' ],

  ].forEach(function([ from, to, expected ]) {
    it(`goes from "${from}" to "${to}" with "${expected}"`, function() {
      assert.equal(Subject(to, from), expected);
    });
  });
});