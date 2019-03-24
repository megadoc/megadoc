const fs = require('fs');

module.exports = function generateInlinePlugin({ assetUtils, config, outputPath }) {
  const items = []

  if (config.notFoundComponent) {
    items.push(`
      module.exports.push({
        name: 'not-found-plugin',
        outletOccupants: [
          {
            name: 'Core::NotFound',
            key: 'Inline::NotFound',
            component: require("${config.notFoundComponent}")
          }
        ]
      })
    `)
  }

  if (config.extensions) {
    config.extensions.forEach(file => {
      items.unshift(`module.exports.push(require("${assetUtils.getAssetPath(file)}"))`)
    })
  }

  if (items.length === 0) {
    return false
  }

  items.unshift(`module.exports = []`)

  fs.writeFileSync(outputPath, items.join("\n"), 'utf8');

  return true;
}