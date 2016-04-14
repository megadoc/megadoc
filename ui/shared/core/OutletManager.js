const { findWhere } = require('lodash');
const invariant = require('utils/invariant');

let outlets = [];

/**
 * This is the underlying module that allows you to register elements for
 * [Outlet outlets]() and define them.
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
OutletManager.define = function(name, options = {}) {
  invariant(!findWhere(outlets, { name }),
    `Outlet ${name} had already been defined.`
  );

  if (process.env.NODE_ENV !== 'production') {
    console.debug('Outlet defined: "%s"', name);
  }

  outlets.push({ name, options, elements: [] });
};

OutletManager.get = function(name) {
  const outlet = findWhere(outlets, { name });

  invariant(!!outlet, `Unknown outlet ${name}.`);

  return outlet;
};

/**
 * Register an element to be rendered inside an [Outlet outlet]().
 *
 * @param {String} name
 *        The outlet ID.
 *
 * @param {Object} element
 *        A description of the element.
 *
 * @param {String} element.key
 *        **REQUIRED** - a unique identifier for the component (within that
 *        outlet.)
 *
 * @param {React.Class} element.component
 *        **REQUIRED** - the component to render inside the outlet.
 */
OutletManager.add = function(name, element) {
  const outlet = OutletManager.get(name);

  invariant(typeof element.key === 'string',
    "You must specify a unique string key as @key for the outlet component."
  );

  invariant(typeof element.component === 'function',
    "You must specify a React.Class as @component for the outlet component."
  );

  if (outlet.options.firstMatching) {
    invariant(element.match instanceof Function,
      `You must define a #match function to inject into the outlet ${name}.`
    );
  }

  outlet.elements.push(element);
};

OutletManager.getElements = function(name) {
  return OutletManager.get(name).elements;
};

OutletManager.getPrevElements = function(name) {
  return outlets.reduce(function(siblings, outlet) {
    outlet.elements.forEach(function(el) {
      if (el.position && el.position.before === name) {
        siblings.push(el);
      }
    });

    return siblings;
  }, []);
};

OutletManager.getNextElements = function(name) {
  return outlets.reduce(function(siblings, outlet) {
    outlet.elements.forEach(function(el) {
      if (el.position && el.position.after === name) {
        siblings.push(el);
      }
    });

    return siblings;
  }, []);
};
