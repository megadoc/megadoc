/* jshint -W098 */
var Benchmark = require('benchmark');

var Set = require('..').Set;

function runSuite(name, func) {
  var suite = new Benchmark.Suite(name);
  suite.on('start', function() {
    console.log();
    console.log(this.name);
    console.log(new Array(this.name.length + 1).join('='));
  });
  suite.on('cycle', function(event) {
    console.log('    ' + event.target);
  });
  suite.on('error', function(event) {
    console.error('    ' + event.target.error);
  });
  func(suite);
  suite.run();
}

runSuite('Set', function(suite) {
  suite.add('keys', {
    fn: function() { set.keys(); },
    setup: function() { var set = new this.Set([1]); },
    Set: Set
  });

  suite.add('has (hit)', {
    fn: function() { set.has(1); },
    setup: function() { var set = new this.Set([1]); },
    Set: Set
  });

  suite.add('has (miss)', {
    fn: function() { set.has(2); },
    setup: function() { var set = new this.Set([1]); },
    Set: Set
  });

  suite.add('add', {
    fn: function() { set.add(1); },
    setup: function() { var set = new this.Set(); },
    Set: Set
  });

  suite.add('remove', {
    fn: function() { set.remove(1); },
    setup: function() { var set = new this.Set([1]); },
    Set: Set
  });

  suite.add('intersect 100 + 100 disjoint', {
    fn: function() { this.Set.intersect([set1, set2]); },
    setup: function() {
      var set1 = new this.Set();
      var set2 = new this.Set();
      for (var len = 100, i = 0; i < len; ++i) {
        set1.add(i);
        set2.add(i + len);
      }
    },
    Set: Set
  });

  suite.add('intersect 100 + 100 same set', {
    fn: function() { this.Set.intersect([set1, set2]); },
    setup: function() {
      var set1 = new this.Set();
      var set2 = new this.Set();
      for (var len = 100, i = 0; i < len; ++i) {
        set1.add(i);
        set2.add(i);
      }
    },
    Set: Set
  });

  suite.add('union 100 + 100 disjoint', {
    fn: function() { this.Set.union([set1, set2]); },
    setup: function() {
      var set1 = new this.Set();
      var set2 = new this.Set();
      for (var len = 100, i = 0; i < len; ++i) {
        set1.add(i);
        set2.add(i + len);
      }
    },
    Set: Set
  });

  suite.add('union 100 + 100 same set', {
    fn: function() { this.Set.union([set1, set2]); },
    setup: function() {
      var set1 = new this.Set();
      var set2 = new this.Set();
      for (var len = 100, i = 0; i < len; ++i) {
        set1.add(i);
        set2.add(i);
      }
    },
    Set: Set
  });
});
