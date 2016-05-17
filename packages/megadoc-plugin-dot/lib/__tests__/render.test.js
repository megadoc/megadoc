var Subject = require("../render");
var multiline = require('multiline-slash');
var assert = require('chai').assert;

describe("megadoc-plugin-dot::render", function() {
  it('works', function() {
    var out = Subject(multiline(function() {;
      // graph {
      //   Root -- A -- B;
      //   B -- C;
      //   B -- D;
      // }
    }));

    assert.include(out, '<svg');
  });
});