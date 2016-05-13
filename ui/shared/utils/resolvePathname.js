const URIjs = require('urijs');

const resolvePathname = function(to, from) {
  try {
    return URIjs(to).relativeTo(from);
  }
  catch(e) {
    if (e.message === 'URI is already relative') {
      return to;
    }

    throw e;
  }
};

module.exports = resolvePathname;