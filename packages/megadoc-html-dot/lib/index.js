const path = require('path');
const defaults = require('./config');
const root = path.resolve(__dirname, '..');

module.exports = {
  name: 'megadoc-html-dot',
  configureFn: userOptions => Object.assign({}, defaults, userOptions),
  serializerOptions: {
    html: {
      styleSheets: [
        path.join(root, 'ui/css/index.less'),
      ],

      codeBlockRenderers: [
        {
          lang: 'dot',
          renderFn: require('./render')
        }
      ]
    }
  }
}
