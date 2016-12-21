const path = require('path');
const root = path.resolve(__dirname, '..', '..', '..');

exports.ROOT = root;
exports.BUNDLE_DIR = path.join(root, 'dist');
exports.CONFIG_FILE = 'config.js';
exports.VENDOR_BUNDLE = 'megadoc__vendor';
exports.COMMON_BUNDLE = 'megadoc__common';
exports.MAIN_BUNDLE = 'megadoc';
exports.STYLE_BUNDLE = 'styles.css';
exports.CORE_STYLE_ENTRY = path.join(root, 'ui/css/index.less');
exports.VERSION = require(path.join(root, 'package')).version;