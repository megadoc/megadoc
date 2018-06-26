const Linter = require('../')
const { assert, createSinonSuite } = require('megadoc-test-utils')

describe('megadoc::linter', function() {
  const sinon = createSinonSuite(this)

  it('turns off logging for requested rules', function(done) {
    sinon.stub(console, 'log')

    const subject = Linter.for({
      assetRoot: '/tmp',
      lintReportingFrequency: 0,
      lintRules: {
        'some-rule': 0
      }
    })

    subject.logRuleEntry({
      loc: {
        filePath: 'some-file.txt',
        line: 3
      },
      rule: {
        name: 'some-rule',
        messageFn: () => 'hai',
      }
    })

    setTimeout(() => {
      assert.notCalled(console.log)
      done()
    }, 0)
  })
})