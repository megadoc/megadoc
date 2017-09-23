const crypto = require('crypto');

function assignUID(node) {
  switch (node.type) {
    case 'Namespace':
      return Object.assign(node, {
        uid: generateUIDForNode(node),
        documents: node.documents ? node.documents.map(assignUID) : node.documents
      });

    case 'Document':
      return Object.assign(node, {
        uid: generateUIDForNode(node),
        documents: node.documents ? node.documents.map(assignUID) : node.documents,
        entities: node.entities ? node.entities.map(assignUID) : node.entities,
      });

    case 'DocumentEntity':
      return Object.assign(node, {
        uid: generateUIDForNode(node),
      });

    default:
      return node;
  }
}

function generateUIDForNode(node) {
  return generateUID([
    node.type,
    node.id,
    node.symbol,
    node.filePath,
    node.loc || null
  ]);
}

function generateUID(object) {
  return calculateMD5Sum(JSON.stringify(object));
}

function calculateMD5Sum(string) {
  return crypto.createHash('md5').update(string).digest("hex");
}

module.exports = assignUID;