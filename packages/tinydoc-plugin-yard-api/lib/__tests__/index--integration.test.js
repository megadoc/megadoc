var Subject = require("../");
var assert = require('chai').assert;
var TinyTestUtils = require('tinydoc/lib/TestUtils');
var tinydoc = require('tinydoc');
var multiline = require('multiline-slash');

describe("[Integration] tinydoc-plugin-yard-api", function() {
  TinyTestUtils.IntegrationSuite(this);

  var config;

  beforeEach(function() {
    config = TinyTestUtils.generateTestConfig({
      verbose: false,
      plugins: [
        Subject({
          verbose: false,
          skipScan: true,
          routeName: 'test',
          source: TinyTestUtils.tempPath('lib/**/*.json')
        })
      ]
    });

    TinyTestUtils.createFile(multiline(function() {;
      // {
      //   "id": "admin_account_configs",
      //   "title": "Admin - Account_Configs",
      //   "text": "Admin config information",
      //   "objects": [],
      //   "endpoints": [
      //     {
      //       "id": "api_admin_account_configs_controller_current",
      //       "scoped_id": "account_configs",
      //       "name": "current",
      //       "title": "Account_Configs",
      //       "text": "This endpoint returns the admin config information.\n\n#### Response codes\n- `200 OK`\n- `401 Unauthorized`",
      //       "controller": "Api::Admin::AccountConfigsController",
      //       "route": {
      //         "path": "/api/admin/account_configs/current",
      //         "verb": "GET"
      //       },
      //       "type": "method",
      //       "source": "def current\n  account = Account.current\n  @account_config = account.config\nend",
      //       "source_type": "ruby",
      //       "signature": "def current",
      //       "files": [
      //         [
      //           "app/controllers/api/admin/account_configs_controller.rb",
      //           21
      //         ]
      //       ],
      //       "dynamic": true,
      //       "group": null,
      //       "visibility": "public",
      //       "tags": [
      //         {
      //           "tag_name": "API",
      //           "text": "Account_Configs",
      //           "name": null,
      //           "types": null
      //         },
      //         {
      //           "tag_name": "example_response",
      //           "text": "{\n  \"account_config\":\n  {\n    \"progressive_finance_customization\": false\n  }\n}",
      //           "name": "",
      //           "types": null
      //         }
      //       ]
      //     }
      //   ]
      // }
    }), 'lib/a.json');

    TinyTestUtils.createFile(multiline(function() {;
      // {
      //   "id": "author_users",
      //   "title": "Author - Users",
      //   "text": "",
      //   "objects": [
      //     {
      //       "id": "api_author_users_controller_user_response",
      //       "scoped_id": "user_response",
      //       "title": "UserResponse",
      //       "text": "",
      //       "controller": "Api::Author::UsersController",
      //       "schema": [
      //         {
      //           "text": "User id",
      //           "name": "id",
      //           "types": [
      //             "Integer"
      //           ],
      //           "is_required": false,
      //           "accepted_values": null
      //         }
      //       ]
      //     }
      //   ],
      //   "endpoints": []
      // }
    }), 'lib/b.json');
  });

  it('works', function(done) {
    var tiny = tinydoc(config, {
      scan: true,
      write: true,
      index: true,
      render: true,
      stats: true,
      purge: true
    });

    tiny.run(function(err, stats) {
      if (err) { return done(err); }

      assert.equal(stats['yard-api:test'].apiCount, 2);
      assert.equal(stats['yard-api:test'].objectCount, 1);
      assert.equal(stats['yard-api:test'].endpointCount, 1);

      done();
    });
  });
});