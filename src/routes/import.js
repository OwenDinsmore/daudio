const express = require('express');
const router = express.Router();
const csvImporter = require('../services/csvImporter');

router.get('/csvs', (req, res) => {
  try {
    const csvs = csvImporter.listCsvs();
    res.json(csvs);
  } catch (err) {
    console.error('List CSVs error:', err.message);
    res.status(500).json({ error: 'Failed to list CSVs' });
  }
});

router.post('/sync', async (req, res) => {
  try {
    const result = await csvImporter.syncAll();
    res.json(result);
  } catch (err) {
    console.error('Sync error:', err.message);
    res.status(500).json({ error: 'Sync failed' });
  }
});

router.get('/status', (req, res) => {
  res.json(csvImporter.getStatus());
});

module.exports = router;
