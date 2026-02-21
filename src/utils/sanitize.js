function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, '');
}

module.exports = { sanitizeFilename };
