const subject = require('../resolveLink');
const config = require('config');
const Database = require('core/Database');
const Router = require('core/Router');
const sinonSuite = require('test_utils/sinonSuite');
const { assert } = require('chai');

describe('yard-api::utils::resolveLink', function() {
  describe('#linkify', function() {
    const sinon = sinonSuite(this);

    it('resolves a link to an API resource', function() {
      sinon.stub(Database, 'getCodeObject', () => {
        return {
          id: 'api_quizzes'
        }
      });

      sinon.stub(Router, 'makeHref')

      var link = subject('api_quizzes', {
        api_quizzes: {
          type: 'yard-api',
          resourceId: 'api_quizzes'
        }
      });

      assert.isObject(link);
      assert.calledWith(Router.makeHref,
        'api.resource',
        { resourceId: 'api_quizzes' },
        { }
      );
    });

    it('resolves a link to an API resource endpoint', function() {
      sinon.stub(Database, 'getCodeObject', () => {
        return {
          id: 'api_quizzes',
          endpoints: [{
            controller: 'Api::Quizzes',
            id: 'api_quizzes_create',
            scoped_id: 'create_a_quiz'
          }]
        }
      });

      sinon.stub(Router, 'makeHref')

      var link = subject('Api::Quizzes#create', {
        'Api::Quizzes#create': {
          type: 'yard-api',
          resourceId: 'api_quizzes',
          endpointId: 'api_quizzes_create'
        }
      });

      assert.isObject(link);
      assert.calledWith(Router.makeHref,
        'api.resource',
        { resourceId: 'api_quizzes' },
        { endpoint: 'create_a_quiz' }
      );
    });

    it('resolves a link to an API resource object', function() {
      sinon.stub(Database, 'getCodeObject', () => {
        return {
          id: 'api_quizzes',
          objects: [{
            controller: 'Api::Quizzes',
            id: 'api_quizzes_quiz',
            scoped_id: 'quiz'
          }]
        }
      });

      sinon.stub(Router, 'makeHref')

      var link = subject('Api::Quizzes::Quiz', {
        'Api::Quizzes::Quiz': {
          type: 'yard-api',
          resourceId: 'api_quizzes',
          objectId: 'api_quizzes_quiz'
        }
      });

      assert.isObject(link);
      assert.calledWith(Router.makeHref,
        'api.resource',
        { resourceId: 'api_quizzes' },
        { object: 'quiz' }
      );
    });
  });
});
