const path = require('path');
const { assert, $, drill, m, createIntegrationSuite } = require('megadoc-test-utils');
const { BREAKPOINT_EMIT_ASSETS } = require('megadoc-compiler')

describe('megadoc-plugin-yard-api::renderFn', function() {
  const integrationSuite = createIntegrationSuite(this);

  describe('@argument', function() {
    it('renders the type as a link', function(done) {
      integrationSuite.createFile('lib/a.json', JSON.stringify({
        "id": "admin_clone_objects",
        "title": "Admin - Clone Objects",
        "text": "",
        "objects": [
          {
            "id": "api_admin_clone_objects_controller_clone_object_request",
            "scoped_id": "clone_object_request",
            "title": "CloneObjectRequest",
            "schema": []
          }
        ],
        "endpoints": [
          {
            "id": "api_admin_clone_objects_controller_create",
            "scoped_id": "create_clone_objects",
            "name": "create",
            "title": "Create Clone Objects",
            "text": "",
            "controller": "Api::Admin::CloneObjectsController",
            "route": {
              "path": "/api/admin/clone_objects",
              "verb": "POST"
            },
            "type": "method",
            "source": "",
            "source_type": "ruby",
            "signature": "def create",
            "files": [
              [
                "app/controllers/api/admin/clone_objects_controller.rb",
                201
              ]
            ],
            "dynamic": true,
            "group": null,
            "visibility": "public",
            "tags": [
              {
                "tag_name": "API",
                "text": "Create Clone Objects",
                "name": null,
                "types": null
              },
              {
                "tag_name": "argument",
                "text": "Body parameter. An array of {API::CloneObjectRequest} to be executed.",
                "name": "clone_objects",
                "types": [
                  "API::CloneObjectRequest[]"
                ],
                "is_required": true,
                "accepted_values": null
              },
            ]
          }
        ]
      }))

      integrationSuite.compile({
        sources: [
          {
            id: 'yard-api',
            include: [
              `lib/*.json`
            ],
            processor: {
              name: path.resolve(__dirname, '../index.js'),
              options: {
                url: '/test',
                name: 'YARD-API Test',
              }
            }
          }
        ]
      }, {
        breakpoint: BREAKPOINT_EMIT_ASSETS
      }, function(err, compilation) {
        if (err) {
          return done(err);
        }

        const documentNode = compilation.renderedCorpus.at('yard-api/admin_clone_objects/create_clone_objects')

        assert.include(
          drill({}, [ $(documentNode.properties.tags[1].types[0]) ])
            .node.text(),
          "Array.<CloneObjectRequest>"
        )

        drill({}, [ $(documentNode.properties.tags[1].types[0]) ])
          .find('a', m.hasText('CloneObjectRequest'))

        drill({}, [ $(documentNode.properties.tags[1].types[0]) ])
          .find('a', m.hasClass('mega-link--internal'))

        done()
      })
    })
  })
})