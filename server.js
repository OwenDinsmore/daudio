const express = require('express');
const path = require('path');
const fs = require('fs');
const { PORT, SETS_DIR, TEMP_DIR } = require('./src/utils/paths');

const searchRouter = require('./src/routes/search');
const downloadRouter = require('./src/routes/download');
const setsRouter = require('./src/routes/sets');
const playbackRouter = require('./src/routes/playback');
const importRouter = require('./src/routes/import');

const { startCleanupInterval } = require('./src/services/tempManager');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/search', searchRouter);
app.use('/api/download', downloadRouter);
app.use('/api/sets', setsRouter);
app.use('/api/play', playbackRouter);
app.use('/api/import', importRouter);

fs.mkdirSync(SETS_DIR, { recursive: true });
fs.mkdirSync(TEMP_DIR, { recursive: true });

startCleanupInterval();

app.listen(PORT, '127.0.0.1', () => {
  console.log(`daudio running at http://localhost:${PORT}`);
});
