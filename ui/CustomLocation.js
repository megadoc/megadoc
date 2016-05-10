const LocationActions = require('react-router/lib/actions/LocationActions');
const History = require('react-router/lib/History');
const DocumentURI = require('core/DocumentURI');
const inFileProtocol = window.location.protocol === 'file:';

var _listeners = [];
var _isListening = false;

/**
 * A Location that uses HTML5 history.
 */
var TinydocLocation = {
  addChangeListener: function addChangeListener(listener) {
    _listeners.push(listener);

    if (!_isListening) {
      if (window.addEventListener) {
        window.addEventListener('popstate', onPopState, false);
      } else {
        window.attachEvent('onpopstate', onPopState);
      }

      _isListening = true;
    }
  },

  removeChangeListener: function removeChangeListener(listener) {
    _listeners = _listeners.filter(function (l) {
      return l !== listener;
    });

    if (_listeners.length === 0) {
      if (window.addEventListener) {
        window.removeEventListener('popstate', onPopState, false);
      } else {
        window.removeEvent('onpopstate', onPopState);
      }

      _isListening = false;
    }
  },

  push(path) {
    if (inFileProtocol) {
      window.location.href = path;
    }
    else {
      window.history.pushState({ path: path }, '', path);
      History.length += 1;
      notifyChange(LocationActions.PUSH);
    }
  },

  replace(path) {
    if (inFileProtocol) {
      window.location.href = path;
    }
    else {
      window.history.replaceState({ path: path }, '', path);
      notifyChange(LocationActions.REPLACE);
    }
  },

  pop() {
    History.back();
  },

  getCurrentPath: function getCurrentPath() {
    const path = decodeURI(window.location.pathname + window.location.search);

    return DocumentURI.withoutExtension(path);
  },

  toString: function toString() {
    return '<TinydocLocation>';
  }
};

function notifyChange(type) {
  var change = {
    path: TinydocLocation.getCurrentPath(),
    type: type
  };

  _listeners.forEach(function (listener) {
    listener.call(TinydocLocation, change);
  });
}

function onPopState(event) {
  if (event.state === undefined) return; // Ignore extraneous popstate events in WebKit.

  notifyChange(LocationActions.POP);
}

module.exports = TinydocLocation;