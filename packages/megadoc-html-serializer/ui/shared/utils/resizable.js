module.exports = function(dragHandle, options) {
  const element = options.target;

  dragHandle.addEventListener('mousedown', startDrag, false);

  let startX, startY;
  let startWidth, startHeight;

  function startDrag(e) {
    e.preventDefault();

    startX = e.clientX;
    startY = e.clientY;

    if (element) {
      startWidth   = parseInt(document.defaultView.getComputedStyle(element).width, 10);
      startHeight  = parseInt(document.defaultView.getComputedStyle(element).height, 10);
    }

    document.documentElement.addEventListener('mousemove', doDrag, false);
    document.documentElement.addEventListener('mouseup', stopDrag, false);

    if (options.onResizeStart) {
      options.onResizeStart();
    }
  }

  function doDrag(e) {
    const newX = e.clientX - startX;
    const newY = e.clientY - startY;

    if (options.onResize) {
      options.onResize(newX, newY);
    }

    if (element) {
      element.style.width = (startWidth + e.clientX - startX) + 'px';
      element.style.height = (startHeight + e.clientY - startY) + 'px';
    }
  }

  function stopDrag(/*e*/) {
    document.documentElement.removeEventListener('mousemove', doDrag, false);
    document.documentElement.removeEventListener('mouseup', stopDrag, false);

    if (options.onResizeStop) {
      options.onResizeStop();
    }
  }

  return {
    destroy() {
      dragHandle.removeEventListener('mousedown', startDrag, false);
    }
  };
}
