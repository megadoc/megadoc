module.exports = function scrollIntoView(node, scrollableNode, offset = 0) {
  const targetY = node.offsetTop + offset;
  let needsScrolling = false;

  if (scrollableNode.scrollTop > targetY) {
    needsScrolling = true;
  }
  else if (scrollableNode.scrollTop + scrollableNode.offsetHeight < targetY) {
    needsScrolling = true;
  }

  if (needsScrolling) {
    scrollElementTo(scrollableNode, targetY, 500);
  }
};

function scrollElementTo(element, to, duration = 500) {
  const start = element.scrollTop;
  const change = to - start;
  const increment = 20;
  let currentTime = 0;

  function animateScroll(){
    currentTime += increment;
    element.scrollTop = easeInOutQuad(currentTime, start, change, duration);

    if (duration > 0 && currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  }

  animateScroll();
}

//t = current time
//b = start value
//c = change in value
//d = duration
function easeInOutQuad(t, b, c, d) {
  t /= d/2;
  if (t < 1) return c/2*t*t + b;
  t--;
  return -c/2 * (t*(t-2) - 1) + b;
}