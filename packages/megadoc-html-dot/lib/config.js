/**
 * @module Config
 * @preserveOrder
 */
module.exports = {
  /**
   * @property {Object}
   *
   * A set of directives to apply to all dot diagrams. Those can still be
   * overridden on a per-diagram basis by specifying them inline as you
   * normally would with nomnoml.
   *
   * Refer to [nomnoml's documentation](https://github.com/skanaar/nomnoml#directives)
   * for the list of available directives.
   *
   * @example
   *
   *     {
   *       fontSize: 16,
   *       stroke: '#ff0'
   *     }
   */
  directives: {
    fontSize: 10,
    font: 'Monospace',
    lineWidth: 1,
    fill: '#f4f4f4',
    stroke: '#404244',
  }
};
