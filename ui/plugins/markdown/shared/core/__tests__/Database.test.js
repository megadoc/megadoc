var Subject = require('../Database');
var config = require('config');

describe('Core::Database', function() {
  beforeEach(function() {
    Object.keys(config).forEach(function(key) { delete config[key]; });
  });

  describe('#getLinkableEntities', function() {
    it('should not blow up', function() {
      config.database = {};

      expect(function() {
        Subject.getLinkableEntities();
      }).not.to.throw();
    });

    it('should work', function() {
      config.database = {
        'cookbook': [
          { filePath: 'how to tame a duck.md' },
          { filePath: 'how to shoot one.md' },
          { filePath: 'how to fry one.md' }
        ]
      };

      var links = Subject.getLinkableEntities();

      expect(Object.keys(links).length).to.equal(3);
      expect(Object.keys(links)).to.contain('how to tame a duck.md');
    });
  });
});