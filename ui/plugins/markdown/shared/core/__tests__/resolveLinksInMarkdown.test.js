var subject = require('../resolveLinksInMarkdown');

describe('core::resolveLinksInMarkdown', function() {
  it('should work', function() {
    subject('cookbook', '');
  });

  describe('given no source', function() {
    it('should find a markdown article by path', function() {
      var resolve = function(path) {
        expect(path).to.equal('doc/cookbook/defeating_flicker_when_sorting.md');
        return '/guides/1.md';
      };

      var linked = subject('cookbook', `
        Hey. This is an introductory.
        See [this guide](tiny://doc/cookbook/defeating_flicker_when_sorting.md) for more info.
      `, resolve);

      expect(linked).to.contain('See [this guide](/guides/1.md)');
    });

    it('should resolve a link with an implicit path', function() {
      var resolve = function(path) {
        expect(path).to.equal('XHRPaginator');
        return '/classes/XHRPaginator';
      };

      var linked = subject('cookbook', `
        See [XHRPaginator]() for more info.
      `, resolve);

      expect(linked).to.contain('See [XHRPaginator](/classes/XHRPaginator)');
    });
  });
});
