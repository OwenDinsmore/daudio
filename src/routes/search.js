const express = require('express');
const router = express.Router();
const { search } = require('../services/ytdlp');

router.get('/', async (req, res) => {
  const query = req.query.q;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Missing search query' });
  }

  try {
    const results = await search(query.trim());
    res.json(results);
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
