const R = require('ramda');
const async = require('async');
const fs = require('fs-extra');
const { tty } = require('megadoc-linter');

module.exports = (state, done) => async.parallel([
  R.partial(removeTempDirectory, [state]),
  R.partial(stopSerializers, [state]),
  R.partial(stopCluster, [state]),
  R.partial(stopServices, [state]),
].map(async.reflect), (error, results) => {
  const failures = results.filter(R.prop('error')).map(R.prop('error'))

  if (failures.length) {
    const serializeError = e => `
      ${tty.pad(4, e.stack)}
    `.trim();

    const combinedError = new Error(tty.nws(`
      Unable to terminate cleanly:

      ${failures.map(serializeError)}
    `));

    done(combinedError, state);
  }
  else {
    done(null, state);
  }
})

function removeTempDirectory(state, done) {
  fs.remove(state.config.tmpDir, done);
}

function stopSerializers(state, done) {
  const serializers = [ state.serializer ];

  async.parallel(serializers.map(s => s.stop.bind(s)), done)
}

function stopCluster(state, done) {
  state.cluster.stop(done);
}

function stopServices(state, done) {
  state.services.down(done);
}