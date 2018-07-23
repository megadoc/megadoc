const { assert, renderUtils } = require('megadoc-test-utils');
const render = require('../renderFn')
const {
  b,
  codeBlock,
  focused,
  focus,
  linkify,
  markdown,
  escapeHTML,
  renderOps
} = renderUtils

const apiObject = x => b.documentEntity({ ...x, meta: { ...x.meta, entityType: 'api-object' } })
const apiEndpoint = x => b.documentEntity({ ...x, meta: { ...x.meta, entityType: 'api-endpoint' } })

describe('megadoc-plugin-yard-api::renderFn - .text', function() {
  const renderOne = documentNode => {
    return focused(render({ options: {} }, renderOps, documentNode))
  }

  it('extracts the text of an API', function() {
    const subject = renderOne(focus(b.document({
      properties: {
        text: 'foo'
      }
    })))

    assert.deepEqual(subject.text, markdown({ text: linkify({ text: 'foo' }) }))
  })

  it('extracts a complex text of an API', function() {
    const subject = renderOne(focus(b.document({
      properties: {
        text: {
          description: 'foo',
          example: 'bar'
        }
      }
    })))

    assert.deepEqual(subject.text, markdown({ text: linkify({ text: 'foo' }) }))
  })

  it('extracts the text of an API object', function() {
    const subject = renderOne(b.document({
      entities: [
        focus(apiObject({
          properties: {
            text: 'foo',
            schema: []
          }
        }))
      ]
    }))

    assert.deepEqual(subject.text, markdown({ text: linkify({ text: 'foo' }) }))
  })

  it('extracts the complex text of an API object', function() {
    const subject = renderOne(b.document({
      entities: [
        focus(apiObject({
          properties: {
            text: {
              description: 'foo'
            },
            schema: []
          }
        }))
      ]
    }))

    assert.deepEqual(subject.text, markdown({ text: linkify({ text: 'foo' }) }))
  })

  it('extracts the text of an API endpoint', function() {
    const subject = renderOne(b.document({
      entities: [
        focus(apiEndpoint({
          properties: {
            text: 'foo',
            tags: []
          }
        }))
      ]
    }))

    assert.deepEqual(subject.text, markdown({ text: linkify({ text: 'foo' }) }))
  })

  it('renders a complex text of an API endpoint', function() {
    const subject = renderOne(b.document({
      entities: [
        focus(apiEndpoint({
          properties: {
            text: {
              description: 'foo'
            },
            tags: []
          }
        }))
      ]
    }))

    assert.deepEqual(subject.text, markdown({ text: linkify({ text: 'foo' }) }))
  })
})

describe('megadoc-plugin-yard-api::renderFn - APIObject.schema.types', function() {
  const renderOne = (schema, options = {}) => {
    return render({ options }, renderOps, b.document({
      entities: [
        focus(apiObject({
          properties: {
            schema
          }
        }))
      ]
    }))
  }

  it('renders types as links', function() {
    const subject = renderOne([
      { types: ['String'] }
    ])

    assert.deepEqual(focused(subject).schema[0].types[0], markdown({
      text: linkify({
        text: escapeHTML({
          text: '[String]()'
        })
      })
    }))
  })

  it('renders link-annotated types as links', function() {
    const subject = renderOne([
      { types: ['{String}'] }
    ])

    assert.deepEqual(focused(subject).schema[0].types[0], markdown({
      text: linkify({
        text: escapeHTML({
          text: '[String]()'
        })
      })
    }))
  })

  it('renders a type as an array if it is suffixed by []', function() {
    const subject = renderOne([
      { types: [ 'String[]' ] }
    ], { arrayTypeStartSymbol: 'ARRAY< ', arrayTypeEndSymbol: ' >' })

    assert.deepEqual(focused(subject).schema[0].types[0], markdown({
      text: linkify({
        text: escapeHTML({
          text: 'ARRAY< [String]() >'
        })
      })
    }))
  })
})

describe('megadoc-plugin-yard-api::renderFn - @argument', function() {
  const renderOne = () => focused(
    render({ options: {} }, renderOps, b.document({
      entities: [
        focus(apiEndpoint({
          properties: {
            tags: [{
              "tag_name": "argument",
              "text": "Body parameter. An array of {API::CloneObjectRequest} to be executed.",
              "name": "clone_objects",
              "types": [
                "API::CloneObjectRequest[]"
              ],
              "is_required": true,
              "accepted_values": null
            }]
          }
        }))
      ]
    }))
  )

  it('renders the text', function() {
    const subject = renderOne()

    assert.deepEqual(subject.tags[0].text, markdown({
      text: linkify({
        text: 'Body parameter. An array of {API::CloneObjectRequest} to be executed.'
      })
    }))
  })

  it('renders type links', function() {
    const subject = renderOne()

    assert.deepEqual(subject.tags[0].types[0], markdown({
      text: linkify({
        text: escapeHTML({
          text: '[API::CloneObjectRequest]()'
        })
      })
    }))
  })
})

describe('megadoc-plugin-yard-api::renderFn - @example_request / @example_response', function() {
  const renderOne = (tag, options = {}) => {
    return render({ options }, renderOps, b.document({
      entities: [
        focus(apiEndpoint({
          properties: {
            tags: [tag]
          }
        }))
      ]
    }))
  }

  [ 'example_request', 'example_response' ].forEach(tag_name => {
    it(`renders @${tag_name}.text as a JSON markdown code-block`, function() {
      const code = `
        hello
        world!
      `
      const subject = renderOne({
        tag_name,
        text: code
      })

      assert.deepEqual(focused(subject).tags[0].text, markdown({
        text: linkify({
          text: markdown({
            text: codeBlock({
              text: code
            })
          })
        })
      }))
    })
  })
})

describe('megadoc-plugin-yard-api::renderFn - @returns', function() {
  const renderOne = (tag, options = {}) => {
    return focused(
      render({ options }, renderOps, b.document({
        entities: [
          focus(apiEndpoint({
            properties: {
              tags: [tag]
            }
          }))
        ]
      }))
    )
  }

  it('renders as a code-block if the text has multiple lines', function() {
    const code = `
      hello
      world!
    `
    const subject = renderOne({
      tag_name: 'returns',
      text: code
    })

    assert.equal(subject.tags[0].codeBlock, true)
    assert.deepEqual(subject.tags[0].text, markdown({ text: linkify({ text: code }) }))
  })

  it('renders as a link if it looks like a YARD-API link', function() {
    const input = `{API::LearningItems}`
    const subject = renderOne({
      tag_name: 'returns',
      text: input
    })

    assert.notOk(subject.tags[0].codeBlock)
    assert.deepEqual(subject.tags[0].text, markdown({
      text: linkify({
        text: escapeHTML({
          text: '[API::LearningItems]()'
        })
      })
    }))
  })

  it('does not render it as a link if it is marked as a built-in type', function() {
    const input = `{String}`
    const subject = renderOne({
      tag_name: 'returns',
      text: input
    }, {
      builtInTypes: [ 'String' ]
    })

    assert.notOk(subject.tags[0].codeBlock)
    assert.deepEqual(subject.tags[0].text, 'String')
  })

  it('renders as plain text otherwise', function() {
    const input = `FooBar`
    const subject = renderOne({
      tag_name: 'returns',
      text: input
    })

    assert.notOk(subject.tags[0].codeBlock)
    assert.deepEqual(subject.tags[0].text, 'FooBar')
  })
})
