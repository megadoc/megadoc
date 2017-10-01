const React = require("react");
const { render, unmountComponentAtNode } = require('react-dom');
const config = require("./config");
const EventEmitter = require('../../../EventEmitter');
const { assign } = require('lodash');

/*
 * @lends TestHelpers.reactSuite
 */
function ReactSuiteAPI(type, options = { immediatelyAttachToDOM: false }) {
  assign(this, EventEmitter([ 'change' ]));

  this.container = undefined;
  this.subject = undefined;
  this.immediatelyAttachToDOM = options.immediatelyAttachToDOM;

  this.routes = [];
  this.routeSpecs = [];
  this.type = type;
}

/*
 * @return {HTMLElement}
 *         The DOM node the subject will be attached to if running in inspect
 *         mode or when [#attachToDOM]() is called.
 */
ReactSuiteAPI.getDOMContainer = function() {
  return config.container;
};

/*
 * Render and mount an instance of the test subject.
 *
 * @param  {Object|Function} initialProps
 *         A set of props that the component should be mounted with.
 *         If this is a function, it must return an Object.
 *
 * @param  {Function} done
 *         A callback that will be invoked when the subject is fully mounted and
 *         ready to be operated on.
 *
 * @async
 * @emit change
 */
ReactSuiteAPI.prototype.createSubject = function(initialProps, done) {
  const Type = this.type;
  const props = this.initialProps = initialProps instanceof Function ?
    initialProps() :
    initialProps
  ;

  this.container = document.createElement("div");

  if (this.immediatelyAttachToDOM) {
    this.attachToDOM();
  }

  this.subject = render(<Type {...props} />, this.container);

  this.emit('change');

  if (done) {
    done(this.subject, this.container);
  }
};

ReactSuiteAPI.prototype.setProps = function(props) {
  this.subject = render(<this.type {...this.initialProps} {...props} />, this.container);
};

/*
 * @return {Boolean}
 *         Whether the subject is currently mounted and can be operated on.
 */
ReactSuiteAPI.prototype.isRunning = function() {
  return Boolean(this.container);
};

/*
 * @return {React.Component}
 *         The instance of the test subject. This is normally found in the
 *         global "subject" variable.
 */
ReactSuiteAPI.prototype.getSubject = function() {
  return this.subject;
};

/*
 * @return {HTMLElement}
 *         The DOM node the subject was mounted on.
 */
ReactSuiteAPI.prototype.getContainer = function() {
  return this.container;
};

/*
 * Unmount and mount the subject again with new initial props.
 *
 * > This will trigger the `componentWillUnmount()` hook!
 *
 * @param  {Object} initialProps
 *         The new set of props to remount with.
 *
 * @emit change
 *
 * @async
 */
ReactSuiteAPI.prototype.remountSubject = function(initialProps, done) {
  if (this.isRunning()) {
    const Type = this.subject.constructor;

    unmountComponentAtNode(this.container);
    this.subject = render(<Type {...initialProps} />, this.container);

    this.emit('change');

    if (done) {
      done();
    }
  }
};

/*
 * Remove the previously created instance in [#createSubject](). This will also
 * undo all side-effects to the React and Ember routes.
 *
 * @emit change
 */
ReactSuiteAPI.prototype.removeSubject = function() {
  if (this.isRunning()) {
    unmountComponentAtNode(this.container);

    if (this.isAttachedToDOM()) {
      this.detachFromDOM();
    }

    this.container.remove();

    this.subject = undefined;
    this.container = undefined;

    this.emit('change');
  }
};

// -----------------------------------------------------------------------------
// DOM Attaching; for ?inspect=true mode.
// -----------------------------------------------------------------------------

/*
 * Attach the component to the inspection DOM node which resides in the document
 * DOM tree. This could be needed for things that rely on the visibility of
 * the component.
 *
 * @param {Function} callback
 *        Callback to invoke when the subject is inserted into the DOM.
 *
 * @param {Function} callback.detachFromDOM
 *        A callback that will detach the component from the DOM. Call this when
 *        you no longer need the component to be in the DOM.
 *
 *        This is done automatically for you when the suite is torn down.
 *
 *        Optionally, you can call [#detachFromDOM]() manually.
 *
 */
ReactSuiteAPI.prototype.attachToDOM = function(callback) {
  ReactSuiteAPI.getDOMContainer().appendChild(this.container);

  if (callback) {
    callback(this.detachFromDOM.bind(this));
  }
};

/*
 * @return {Boolean}
 *         Whether the component is currently visible in the document DOM tree.
 */
ReactSuiteAPI.prototype.isAttachedToDOM = function() {
  return (
    this.container &&
    this.container.parentElement === ReactSuiteAPI.getDOMContainer()
  );
};

/*
 * Detach the component from the document DOM tree, rendering it invisible once
 * again.
 */
ReactSuiteAPI.prototype.detachFromDOM = function() {
  if (this.isAttachedToDOM()) {
    this.container.parentElement.removeChild(this.container);
  }
};

module.exports = ReactSuiteAPI;
