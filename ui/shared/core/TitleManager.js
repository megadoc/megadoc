var invariant = require('utils/invariant');
var config = require('config');

/**
 * A module for adjusting the document's title for a while then restoring it.
 *
 * @param  {Function} generateTitle
 *         A function that must yield the new title (if any) when the manager
 *         is asked to update.
 *
 * @return {Object} titleMgr
 */
function TitleManager(generateTitle) {
  var previousTitle; // we'll track it on the first call to #update()

  invariant(generateTitle instanceof Function,
    `You must provide a title generator function to TitleManager, got ${typeof generateTitle}.`
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
      var newTitle = generateTitle.apply(null, arguments);

      if (newTitle && newTitle !== document.title) {
        if (!previousTitle) { // track the "anchor" title if we haven't yet
          previousTitle = document.title;
        }

        document.title = newTitle + ' - ' + config.title;

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
      if (previousTitle && previousTitle !== document.title) {
        setTimeout(function() {
          document.title = previousTitle;
        }, TitleManager.TIMEOUT);

        return true;
      }
    }
  };
}

TitleManager.TIMEOUT = 2;

module.exports = TitleManager;