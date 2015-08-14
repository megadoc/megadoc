var Subject = require('../YARDAPILinkResolver');
var config = require('config');

describe('Core::YARDAPILinkResolver', function() {
  describe('#linkify', function() {
    it('should work', function() {
      config.database = [{
        id: 'Quizzes'
      }];

      var linked = Subject(`
        # Foo

        Hello. Look at {Quizzes} for more info!
      `);

      expect(linked).to.contain('[Quizzes](/api/class/Quizzes)');
    });
  });
});