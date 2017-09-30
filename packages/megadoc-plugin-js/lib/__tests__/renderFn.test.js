const { assert, createBuildersWithUIDs } = require('megadoc-test-utils');
const subject = require('../renderFn');
const b = createBuildersWithUIDs(require('megadoc-corpus'));
const HTMLRenderingSuite = require('megadoc-test-utils/HTMLRenderingSuite');

describe('megadoc-plugin-js::renderFn', function() {
  const defaultContext = {
    compilerOptions: {},
    options: {},
  };

  it('renders the description from markdown into html and linkifies it', function() {
    const document = b.document({
      id: 'truck',
      title: 'truck',
      properties: {
        description: 'Hello *World*!',
        tags: [],
      }
    })

    const renderer = HTMLRenderingSuite.getRenderer();
    const descriptor = subject(defaultContext, renderer, document)

    HTMLRenderingSuite.assertDidRender(descriptor, {
      location: 'description',
      using: renderer.markdown({
        text: renderer.linkify({
          text: document.properties.description,
          contextNode: document,
        }),
        contextNode: document,
      })
    });
  });

  describe('tag rendering...', function() {
    it('renders the typeInfo description', function() {
      const document = b.document({
        id: 'truck',
        title: 'truck',
        properties: {
          tags: [
            {
              type: 'param',
              typeInfo: {
                description: 'Hello *World*!',
              }
            }
          ]
        }
      })

      const renderer = HTMLRenderingSuite.getRenderer();
      const descriptor = subject(defaultContext, renderer, document)

      HTMLRenderingSuite.assertDidRender(descriptor, {
        location: 'tags[0].typeInfo.description',
        using: renderer.markdown({
          text: renderer.linkify({
            text: document.properties.tags[0].typeInfo.description,
            contextNode: document,
          }),
          contextNode: document,
        })
      });
    });

    it('renders the string for tags that support it', function() {
      const document = b.document({
        id: 'truck',
        title: 'truck',
        properties: {
          tags: [
            {
              type: 'example',
              typeInfo: {},
              string: 'foobar'
            }
          ]
        }
      })

      const renderer = HTMLRenderingSuite.getRenderer();
      const descriptor = subject(defaultContext, renderer, document)

      HTMLRenderingSuite.assertDidRender(descriptor, {
        location: 'tags[0].string',
        using: renderer.markdown({
          text: renderer.linkify({
            text: document.properties.tags[0].string,
            contextNode: document,
          }),
          contextNode: document,
        })
      });
    });
  });

  describe('the @see tag...', function() {
    it('it does NOT linkify the type if it is built-in', function() {
      const document = b.document({
        id: 'truck',
        title: 'truck',
        properties: {
          tags: [
            {
              type: 'see',
              typeInfo: {
                name: 'Object'
              },
            }
          ]
        }
      })

      const renderer = HTMLRenderingSuite.getRenderer();
      const descriptor = subject(defaultContext, renderer, document)

      assert.equal(
        HTMLRenderingSuite.getValueAt(descriptor, 'tags[0].typeInfo.name'),
        'Object'
      );
    });

    it('it does linkify the type otherwise', function() {
      const document = b.document({
        id: 'truck',
        title: 'truck',
        properties: {
          tags: [
            {
              type: 'see',
              typeInfo: {
                name: 'FooBar'
              },
            }
          ]
        }
      })

      const renderer = HTMLRenderingSuite.getRenderer();
      const descriptor = subject(defaultContext, renderer, document)

      HTMLRenderingSuite.assertDidRender(descriptor, {
        location: 'tags[0].typeInfo.name',
        using: renderer.linkifyFragment({
          format: 'html',
          contextNode: document,
          text: 'FooBar',
        })
      });
    });
  });

  describe('tag types...', function() {
    it('renders the type @name into @html if it is not an expression', function() {
      const document = b.document({
        id: 'truck',
        title: 'truck',
        properties: {
          tags: [
            {
              type: 'param',
              typeInfo: {
                type: {
                  name: 'FooBar'
                }
              }
            }
          ]
        }
      })

      const renderer = HTMLRenderingSuite.getRenderer();
      const descriptor = subject(defaultContext, renderer, document)

      HTMLRenderingSuite.assertDidRender(descriptor, {
        location: 'tags[0].typeInfo.type.html',
        using: renderer.linkifyFragment({
          contextNode: document,
          format: 'html',
          text: 'FooBar'
        })
      });
    });

    it('renders the type elements', function() {
      const document = b.document({
        id: 'truck',
        title: 'truck',
        properties: {
          tags: [
            {
              type: 'param',
              typeInfo: {
                type: {
                  name: 'Union',
                  elements: [
                    {
                      name: 'Foo',
                    },
                    {
                      name: 'Bar',
                    }
                  ]
                }
              }
            }
          ]
        }
      })

      const renderer = HTMLRenderingSuite.getRenderer();
      const descriptor = subject(defaultContext, renderer, document)

      HTMLRenderingSuite.assertDidRender(descriptor, {
        location: 'tags[0].typeInfo.type.elements[0].html',
        using: renderer.linkifyFragment({
          contextNode: document,
          format: 'html',
          text: 'Foo'
        })
      });

      HTMLRenderingSuite.assertDidRender(descriptor, {
        location: 'tags[0].typeInfo.type.elements[1].html',
        using: renderer.linkifyFragment({
          contextNode: document,
          format: 'html',
          text: 'Bar'
        })
      });
    });

    describe('FunctionType...', function() {
      it("renders each param's @name into @html", function() {
        const document = b.document({
          id: 'truck',
          title: 'truck',
          properties: {
            tags: [
              {
                type: 'param',
                typeInfo: {
                  type: {
                    name: 'Function',
                    params: [
                      {
                        name: 'Foo'
                      }
                    ]
                  }
                }
              }
            ]
          }
        })

        const renderer = HTMLRenderingSuite.getRenderer();
        const descriptor = subject(defaultContext, renderer, document)

        HTMLRenderingSuite.assertDidRender(descriptor, {
          location: 'tags[0].typeInfo.type.params[0].html',
          using: renderer.linkifyFragment({
            contextNode: document,
            format: 'html',
            text: 'Foo'
          })
        });
      });

      it("renders @returnType.name into @returnType.html", function() {
        const document = b.document({
          id: 'truck',
          title: 'truck',
          properties: {
            tags: [
              {
                type: 'param',
                typeInfo: {
                  type: {
                    name: 'Function',
                    params: [],
                    returnType: {
                      name: 'Foo'
                    }
                  }
                }
              }
            ]
          }
        })

        const renderer = HTMLRenderingSuite.getRenderer();
        const descriptor = subject(defaultContext, renderer, document)

        HTMLRenderingSuite.assertDidRender(descriptor, {
          location: 'tags[0].typeInfo.type.returnType.html',
          using: renderer.linkifyFragment({
            contextNode: document,
            format: 'html',
            text: 'Foo'
          })
        });
      });
    });

    describe('ObjectProperty types...', function() {
      it('renders the type "key" @name into @html', function() {
        const document = b.document({
          id: 'truck',
          title: 'truck',
          properties: {
            tags: [
              {
                type: 'param',
                typeInfo: {
                  type: {
                    name: 'Object',
                    elements: [
                      {
                        name: 'ObjectProperty',
                        key: {
                          name: 'x'
                        },
                        value: {
                          name: 'Foo'
                        }
                      },
                      {
                        name: 'ObjectProperty',
                        key: {
                          name: 'y'
                        },
                        value: {
                          name: 'Bar'
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        })

        const renderer = HTMLRenderingSuite.getRenderer();
        const descriptor = subject(defaultContext, renderer, document)

        HTMLRenderingSuite.assertDidRender(descriptor, {
          location: 'tags[0].typeInfo.type.elements[0].key.html',
          using: renderer.linkifyFragment({
            contextNode: document,
            format: 'html',
            text: 'x'
          })
        });

        HTMLRenderingSuite.assertDidRender(descriptor, {
          location: 'tags[0].typeInfo.type.elements[0].value.html',
          using: renderer.linkifyFragment({
            contextNode: document,
            format: 'html',
            text: 'Foo'
          })
        });

        HTMLRenderingSuite.assertDidRender(descriptor, {
          location: 'tags[0].typeInfo.type.elements[1].key.html',
          using: renderer.linkifyFragment({
            contextNode: document,
            format: 'html',
            text: 'y'
          })
        });

        HTMLRenderingSuite.assertDidRender(descriptor, {
          location: 'tags[0].typeInfo.type.elements[1].value.html',
          using: renderer.linkifyFragment({
            contextNode: document,
            format: 'html',
            text: 'Bar'
          })
        });
      });
    });
  })
});