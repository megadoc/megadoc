const generateHTMLFile = require('./generateHTMLFile');
const { dumpNodeFilePath } = require('megadoc-corpus');

module.exports = function DocumentFileEmitter(params) {
  const ui = params.ui;
  const corpus = params.corpus;

  return function emitDocumentFile(uid, done) {
    const node = typeof uid === 'string' ? corpus[uid] : uid;
    const href = node.meta && node.meta.href;

    if (node.type === 'DocumentEntity') {
      return done();
    }
    else if (!href) {
      console.log('Document "%s" has no @href - an HTML file will not be emitted.', node.uid);
      return done();
    }

    const filePath = node.meta && node.meta.htmlFilePath;

    if (params.verbose) {
      console.log('Emitting HTML file "%s" (URL = "%s", UID = "%s")', filePath, href, node.uid);
    }

    ui.render(href, function(err, html) {
      if (err) {
        console.warn("Unable to emit file for '%s': %s", node.uid, err);
        return done();
      }

      const distanceFromRoot = href.split('/').length - 1;
      const docHTML = generateHTMLFile({
        assetRoot: params.assetRoot,
        assets: params.assets,
        distanceFromRoot: distanceFromRoot,
        runtimeOutputPath: params.runtimeOutputPath,
        params: {
          title: node.title,
          metaDescription: node.summary,
          contents: html,
          startingDocumentUID: node.uid,
          startingDocumentHref: node.meta && node.meta.href,
        },
        sourceFile: params.htmlFile,
        favicon: params.favicon,
      });

      const rc = params.assetUtils.writeAsset(filePath, docHTML, {
        forceOverwrite: node.meta.hrefRewritten
      });

      if (rc === 'ERR_FILE_EXISTS' && node.type !== 'Namespace') {
        console.error('Offending document:', dumpNodeFilePath(node));
      }

      done();
    });
  }
}