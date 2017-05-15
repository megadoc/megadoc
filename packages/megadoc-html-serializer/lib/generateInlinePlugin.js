const fs = require('fs');

module.exports = function generateInlinePlugin({ config, outputPath }) {
  const outletOccupants = [];

  if (config.notFoundComponent) {
    outletOccupants.push(`{
      name: 'Layout::NotFound',
      key: 'Inline::NotFound',
      component: require("${config.notFoundComponent}")
    }`)
  }

  if (!outletOccupants) {
    return false;
  }

  const entry = `
    exports.name = 'megadoc-plugin-inline';
    exports.outletOccupants = [
    ${outletOccupants.join(",\n")}
    ]
  `;


  fs.writeFileSync(outputPath, entry, 'utf8');
}