const { builders: b } = require('megadoc-corpus');
const at = uid => descriptors => descriptors.filter(x => x[0] === uid).map(x => x[1])[0]
const focus = x => Object.assign({}, x, { uid: 'test-node' })
const renderOps = {
  codeBlock: ({ text }) => [ 'codeBlock', text ],
  escapeHTML: ({ text }) => [ 'escapeHTML', text ],
  linkify: ({ text }) => ([ 'linkify', text ]),
  markdown: ({ text }) => [ 'markdown', text ],
}

module.exports = {
  ...renderOps,
  at,
  b,
  focus,
  focused: at('test-node'),
  renderOps,
}
