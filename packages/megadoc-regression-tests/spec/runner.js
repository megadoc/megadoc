const yaml = require('js-yaml');
const path = require('path');
const packageName = process.env['PACKAGE'];
const specFile = path.resolve(__dirname, `${packageName}.spec.yml`);
const spec = yaml.safeLoad(specFile);

describe(path.basename(specFile), function() {
  it('works', function() {})
});