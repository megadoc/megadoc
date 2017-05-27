const BreakpointError = function(result) {
  this.result = result;
  this.message = 'Aborted';
};

BreakpointError.prototype = Object.create(Error);

module.exports = function createBreakpoint(breakpoint, tap = Function.prototype) {
  return function defineBreakpoint(stage) {
    const shouldBreak = breakpoint && breakpoint <= stage || false;

    return function createBreakableFunction(fn) {
      if (shouldBreak) {
        return function(x, done) {
          tap(x);

          done(new BreakpointError(x));
        }
      }
      else {
        return fn;
      }
    }
  }
}
module.exports.BreakpointError = BreakpointError;