module.exports = function(cond, message) {
  if (arguments.length > 2) {
    var subs = [].slice.call(arguments, 2);

    message = message.replace(/%s/g, function() {
      return subs.shift();
    });
  }

  if (!cond) {
    throw new Error(message);
  }
};