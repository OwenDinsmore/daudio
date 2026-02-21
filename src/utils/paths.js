const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const SETS_DIR = path.join(ROOT_DIR, 'sets');
const TEMP_DIR = path.join(ROOT_DIR, 'tmp');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const PORT = process.env.PORT || 3000;

module.exports = { ROOT_DIR, SETS_DIR, TEMP_DIR, DATA_DIR, PORT };
