module.exports = function getLinkHref(component, link) {
  return (
    link.href.match(/^http/) ?
      link.href :
      component.context.documentURI.withExtension(link.href)
  );
}