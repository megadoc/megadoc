const path = require('path');
const root = path.resolve(__dirname, '..');

exports.ROOT = root;
exports.BUNDLE_DIR = path.join(root, 'dist');
exports.CONFIG_BUNDLE = 'megadoc__config';
exports.VENDOR_BUNDLE = 'megadoc__vendor';
exports.COMMON_BUNDLE = 'megadoc__common';
exports.STYLES_BUNDLE = 'megadoc__styles';
exports.MAIN_BUNDLE = 'megadoc';

exports.STYLES_FILE = 'megadoc__styles.css';
exports.CONFIG_FILE = 'megadoc__config.js';
exports.CORE_STYLE_ENTRY = path.join(root, 'ui/css/index.less');
exports.VERSION = require(path.join(root, 'package')).version;
