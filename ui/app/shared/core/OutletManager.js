const { findWhere } = require('lodash');
const invariant = require('utils/invariant');

let outlets = [];

/**
 * @singleton
 * Layout outlets.
 */
let OutletManager = exports;

/**
 * Define a new outlet in the layout. An outlet must be defined through this
 * API before attempting to inject into it or even render it.
 *
 * @param {String} name
 *        The outlet name.
 *
 * @param {Object} options
 *        Outlet options that control what elements it allows and how it
 *        renders its elements.
 *
 * @param {Boolean} [options.firstMatching=false]
 *        If true, the outlet will render only a single element at all times
 *        and that is the first one that matches the given props.
 *
 * @throws {InvariantError}
 *         If a similar outlet with this name had already been defined.
 */
exports.define = function(name, options = {}) {
  invariant(!findWhere(outlets, { name }),
    `Outlet ${name} had already been defined.`
  );

  outlets.push({ name, options, elements: [] });
};

exports.get = function(name) {
  const outlet = findWhere(outlets, { name });

  invariant(!!outlet, `Unknown outlet ${name}.`);

  return outlet;
};

exports.add = function(name, element) {
  const outlet = this.get(name);

  if (outlet.options.firstMatching) {
    invariant(element.match instanceof Function,
      `You must define a #match function to inject into the outlet ${name}.`
    );
  }

  outlet.elements.push(element);
};

exports.getElements = function(name) {
  return this.get(name).elements;
};

exports.getPrevElements = function(name) {
  return outlets.reduce(function(siblings, outlet) {
    outlet.elements.forEach(function(el) {
      if (el.position && el.position.before === name) {
        siblings.push(el);
      }
    });

    return siblings;
  }, []);
};

exports.getNextElements = function(name) {
  return outlets.reduce(function(siblings, outlet) {
    outlet.elements.forEach(function(el) {
      if (el.position && el.position.after === name) {
        siblings.push(el);
      }
    });

    return siblings;
  }, []);
};

module.exports = OutletManager;