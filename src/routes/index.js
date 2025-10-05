const express = require('express');
const { initSearch, advancedSearch } = require('../controller/corpus')
const quran = require('../data/AL-QURAN_WITH_TRANSLATION_AND_TRANSLITERATION.json')

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    "total_surahs": 114,
    "total_meccan_surahs": 89,
    "total_medinan_surahs": 25,
    "total_verses": 6236,
    "number_of_words": 77430,
    "number_of_unique_words": 18994,
    "number_of_stems": 12183,
    "number_of_lemmas": 3382,
    "number_of_roots": 1685
  });
});

// Simple search endpoint (backward compatible)
router.get('/corpus/:searchTerm', (req, res) => {
  const searchTerm = req.params.searchTerm.toLowerCase()
  const resolve = initSearch(searchTerm)
  resolve.then(r => {
    // Always return an array with the first element containing total_matches
    // This aligns with tests expecting '[{"total_matches ":0}]' when no results
    res.status(200).json(r)
  })
})

// Advanced search endpoint with full verse details
// GET /search?q=your+search+term&field=translation&exact=false
router.get('/search', (req, res) => {
  const { q, field = 'translation', exact = 'false' } = req.query;
  
  if (!q) {
    return res.status(400).json({
      error: 'Missing search query. Use ?q=your+search+term'
    });
  }
  
  const results = advancedSearch(q, {
    exact: exact === 'true',
    partial: true,
    field: field
  });
  
  res.status(200).json({
    total_matches: results.length,
    query: q,
    search_field: field,
    exact_match: exact === 'true',
    results: results
  });
})

// Search in Arabic text
// GET /search/arabic?q=الله
router.get('/search/arabic', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      error: 'Missing search query. Use ?q=arabic_text'
    });
  }
  
  const results = advancedSearch(q, {
    partial: true,
    field: 'arabic'
  });
  
  res.status(200).json({
    total_matches: results.length,
    query: q,
    search_field: 'arabic',
    results: results
  });
})

// Search in transliteration
// GET /search/transliteration?q=ar-rahman
router.get('/search/transliteration', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      error: 'Missing search query. Use ?q=transliteration_text'
    });
  }
  
  const results = advancedSearch(q, {
    partial: true,
    field: 'transliteration'
  });
  
  res.status(200).json({
    total_matches: results.length,
    query: q,
    search_field: 'transliteration',
    results: results
  });
})

// Search across all fields
// GET /search/all?q=rahman
router.get('/search/all', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      error: 'Missing search query. Use ?q=search_term'
    });
  }
  
  const results = advancedSearch(q, {
    partial: true,
    field: 'all'
  });
  
  res.status(200).json({
    total_matches: results.length,
    query: q,
    search_field: 'all (translation, arabic, transliteration)',
    results: results
  });
})

router.get('/:chapterId', (req, res) => {

  const response = quran.chapters[req.params.chapterId]
  if (!response) {
    res.status(404).json({
      "error": `resource not found`
    })
    return;
  }
  res.status(200)
    .json(response);
});


router.get('/:chapterId/:verseId', (req, res) => {

  const chapter = req.params.chapterId
  const range = req.params.verseId.split('-');
  const start = range[0]
  const end = range[1]

  let response = {};
  const chapterData = quran.chapters[chapter];
  const content = chapterData ? chapterData.verses : undefined;
  
  if ((!start || !end) && content ) response = content[req.params.verseId]
  else {

      if (+start > +end || start <= 0 || !content) {
          res.status(400).json({
            "error": `invalid range`
          })
          return;
      }

      response = Object.keys(content)
        .slice(start - 1, end)
        .reduce((acc, k) => ({ ...acc, [k]: content[k] }), {})

  }

  if (!response) {
    res.status(404).json({
      "error": `resource not found`
    })
    return;
  }

  res.status(200)
    .json(response);
});

// Catch-all 404 handler (must be last)
router.get('*', (req, res) => {
  res.status(404).json({
    "error": `resource not found`
  })
})

module.exports = router;
