module.exports = function() {
  if (process.env.NODE_ENV === 'development') {
    console.debug('Scrolling to top');
  }

  window.scrollTo(0, 0);
};