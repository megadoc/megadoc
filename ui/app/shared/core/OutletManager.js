const { findWhere } = require('lodash');
const invariant = require('utils/invariant');

let outlets = [];

let OutletManager = {
  define(name) {
    invariant(!this.get(name), `Outlet ${name} had already been defined.`);

    outlets.push({
      name,
      elements: []
    });
  },

  get(name) {
    return findWhere(outlets, { name });
  },

  add(name, element) {
    let outlet = this.get(name);

    invariant(!!outlet, `Unknown outlet ${name}.`);

    outlet.elements.push(element);
  },

  getElements(name) {
    return this.get(name).elements;
  },

  getPreviousElements(name) {
    return outlets.reduce(function(siblings, outlet) {
      outlet.elements.forEach(function(el) {
        if (el.position && el.position.before === name) {
          siblings.push(el);
        }
      });

      return siblings;
    }, []);
  },

  getNextElements(name) {
    return outlets.reduce(function(siblings, outlet) {
      outlet.elements.forEach(function(el) {
        if (el.position && el.position.after === name) {
          siblings.push(el);
        }
      });

      return siblings;
    }, []);
  },
};

module.exports = OutletManager;