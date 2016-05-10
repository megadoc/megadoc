const Subject = require('../Layout__Utils');
const { assert } = require('chai');
const { assign } = require('lodash');

describe('tinydoc::Components::Layout__Utils', function() {
  describe('getLayoutForDocument', function() {
    const subject = Subject.getLayoutForDocument;

    it('matches by url', function() {
      const layout = subject({
        pathname: '/foo',

        layouts: [{
          match: { by: 'url', on: '/foo' },
          regions: [
            {
              name: 'Layout::Content',
              outlets: null
            }
          ]
        }]
      });

      assert.ok(layout);
    });

    it('matches by type', function() {
      const params = {
        pathname: '/foo',

        layouts: [{
          match: { by: 'type', on: 'DocumentEntity' },
          regions: [
            {
              name: 'Layout::Content',
              outlets: null
            }
          ]
        }]
      };

      assert.notOk(subject(params));
      assert.ok(subject(assign({}, params, { documentNode: { type: 'DocumentEntity' }})));
    });

    it('matches by uid', function() {
      const params = {
        pathname: '/foo',

        layouts: [{
          match: { by: 'uid', on: [ 'api/Database' ] },
          regions: [
            {
              name: 'Layout::Content',
              outlets: null
            }
          ]
        }]
      };

      assert.notOk(subject(assign({}, params, { documentNode: { uid: 'api/foo' }})));
      assert.ok(subject(assign({}, params, { documentNode: { uid: 'api/Database' }})));
    });
  });
});