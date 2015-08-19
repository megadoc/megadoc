const SPEC_ATTRS = [ 'displayName', 'input', 'output', 'parse' ];

let debug;

function Identity(arg) {
  return arg;
}

function createParser(displayName, parse, inputSchema, outputSchema) {
}

/**
 * @module DataModel
 * @constructor
 *
 * Define a model producer. A model is a function that transforms payload of
 * a certain shape (the input schema) into another (the output schema).
 *
 * @param {Object} spec
 *        The model specification.
 *
 * @param {String} spec.displayName
 *        A readable name for the model. Used only for debugging purposes.
 *
 * @param {Object} spec.input
 *        A schema of the input payload you need to produce your model.
 *
 * @param {Object} spec.output
 *        A schema of the output you produce.
 *
 * @return {Object} producer
 *
 * @return {Function} producer.parse
 *         The model production routine.
 *
 * @return {Function} producer.propTypeValidator
 *         A PropType to use in a React component's propTypes specification
 *         that will validate this model. Note, you should not use this
 *         directly, instead, use PropTypes.model() instead.
 */
module.exports = function defineModel(spec) {
  return {
    parse: createParser(spec.displayName, spec.parse || Identity, spec.input, spec.output),
    input: spec.input,
    output: spec.output,
    propTypeValidator: schemaToReactPropTypes(spec.output)
  };
};