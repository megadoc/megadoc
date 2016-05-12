var exec = require('child_process').exec;
var fs = require('fs');
var assign = require('object-assign');
var b = require('tinydoc-corpus').builders;
var RendererUtils = require('tinydoc/lib/RendererUtils');

function generateDocs(config, globalConfig, done) {
  var env = config.env || {};
  var yardApi = exec(config.command, assign({}, {
    cwd: env.cwd || globalConfig.assetRoot
  }));

  yardApi.stdout.pipe(process.stdout);
  yardApi.stderr.pipe(process.stderr);

  yardApi.on('close', function(exitCode) {
    if (exitCode === 0) {
      done();
    }
    else {
      done('yard-api failed to generate the docs');
    }
  });
}

function scan(config, utils, done) {
  var files = utils.globAndFilter(config.source, config.exclude);
  var database = files.map(function(fileName) {
    return JSON.parse(fs.readFileSync(fileName, 'utf-8'));
  });

  done(null, reduce(config, database));
}

module.exports = function(config, globalConfig, utils, done) {
  if (config.skipScan) {
    return scan(config, utils, done);
  }

  generateDocs(config, globalConfig, function(err) {
    if (err) {
      return done(err);
    }

    scan(config, utils, done);
  });
};

function reduce(config, documents) {
  return b.namespace({
    id: config.routeName,
    name: 'tinydoc-plugin-yard-api',
    config: config,
    indexFields: [ 'title' ],
    meta: {
      defaultLayouts: require('./defaultLayouts')
    },
    documents: documents.map(function(doc) {
      return b.document({
        id: doc.id,
        title: doc.title,
        summary: generateSummary(doc),
        properties: doc,
        entities: []
          .concat(doc.objects.map(reduceObjectDocument))
          .concat(doc.endpoints.map(reduceEndpointDocument))
      })
    })
  });

  function reduceObjectDocument(doc) {
    return b.documentEntity({
      id: doc.scoped_id,
      title: doc.title,
      summary: generateSummary(doc),
      meta: { entityType: 'api-object' },
      properties: doc
    });
  }

  function reduceEndpointDocument(doc) {
    return b.documentEntity({
      id: doc.scoped_id,
      title: doc.title,
      summary: generateSummary(doc),
      meta: { entityType: 'api-endpoint' },
      properties: doc
    });
  }
}

function generateSummary(doc) {
  if (doc.text) {
    return RendererUtils.extractSummary(doc.text, {
      plainText: true
    });
  }
}