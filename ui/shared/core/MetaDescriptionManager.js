const invariant = require('utils/invariant');
const config = require('config');

/**
 * @namespace UI.Core
 *
 * A module for adjusting the document's title for a while then restoring it.
 *
 * @param  {Function} generate
 *         A function that must yield the new title (if any) when the manager
 *         is asked to update.
 *
 * @return {Object} titleMgr
 */
function MetaDescriptionManager(generate) {
  let previousValue; // we'll track it on the first call to #update()

  invariant(generate instanceof Function,
    `You must provide a meta description generator function to MetaDescriptionManager, got ${typeof generate}.`
  );

  return {
    /**
     * Call this any-time you suspect the title needs updating (that is, the
     * generator might yield different results than the last update.)
     *
     * @return {Boolean}
     *         Whether the title was updated or not.
     */
    update() {
      const newValue = generate.apply(null, arguments);

      if (newValue && newValue !== getMetaDescription()) {
        if (!previousValue) { // track the "anchor" title if we haven't yet
          previousValue = getMetaDescription();
        }

        setMetaDescription(newValue);

        return true;
      }
      else {
        return false;
      }
    },

    /**
     * Restore the document title to what it was before this instance
     * started fuddling with the title.
     *
     * @async
     * @return {Boolean}
     *         Whether there were any restorations to apply to the title.
     */
    restore() {
      if (previousValue && previousValue !== getMetaDescription()) {
        setTimeout(function() {
          setMetaDescription(previousValue);
        }, MetaDescriptionManager.TIMEOUT);

        return true;
      }
    }
  };
}

function getMetaDescription() {
  return document.querySelector('meta[name="description"]').content;
}

function setMetaDescription(value) {
  document.querySelector('meta[name="description"]').content = value;
}

MetaDescriptionManager.TIMEOUT = 2;

module.exports = MetaDescriptionManager;