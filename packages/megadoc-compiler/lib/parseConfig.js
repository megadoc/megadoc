const Ajv = require('ajv');
const schema = require('./config.schema.json');

module.exports = function parseConfig(config) {
  const ajv = new Ajv({
    allErrors: false,
  });

  if (!ajv.validate(schema, config)) {
    throw new Error(ajv.errorsText());
  }

  return config;
}