const express = require('express');
const { initSearch, advancedSearch } = require('../controller/corpus')
const {
  filterByJuz,
  filterByRevelationType,
  filterByVerseLength,
  getSajdahVerses,
  filterByManzil
} = require('../controller/filters')
const quran = require('../data/AL-QURAN_WITH_TRANSLATION_AND_TRANSLITERATION.json')

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get Quran statistics
 *     tags: [Basic]
 *     description: Returns general statistics about the Quran
 *     responses:
 *       200:
 *         description: Quran statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_surahs:
 *                   type: integer
 *                   example: 114
 *                 total_meccan_surahs:
 *                   type: integer
 *                   example: 89
 *                 total_medinan_surahs:
 *                   type: integer
 *                   example: 25
 *                 total_verses:
 *                   type: integer
 *                   example: 6236
 */
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

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Advanced search with relevance scoring
 *     tags: [Search]
 *     description: Intelligent tokenized search that ignores punctuation and ranks results by relevance
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (supports multi-word phrases)
 *         example: ar rahman
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *           enum: [translation, arabic, transliteration, all]
 *           default: translation
 *         description: Field to search in
 *       - in: query
 *         name: exact
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *           default: 'false'
 *         description: Use exact phrase matching
 *     responses:
 *       200:
 *         description: Search results with relevance scores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResponse'
 *       400:
 *         description: Missing search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /juz/{juzNum}:
 *   get:
 *     summary: Get verses from a specific Juz
 *     tags: [Filters]
 *     description: Retrieve verses from one of the 30 Juz divisions of the Quran with pagination
 *     parameters:
 *       - in: path
 *         name: juzNum
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 30
 *         description: Juz number (1-30)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Paginated verses from the specified Juz
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid Juz number
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/juz/:juzNum', (req, res) => {
  const juzNum = parseInt(req.params.juzNum);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  if (juzNum < 1 || juzNum > 30) {
    return res.status(400).json({
      error: 'Juz number must be between 1 and 30'
    });
  }
  
  const result = filterByJuz(juzNum, { page, limit });
  res.status(200).json(result);
});

// Filter by Manzil (7 parts of Quran)
// GET /manzil/1?page=1&limit=20
router.get('/manzil/:manzilNum', (req, res) => {
  const manzilNum = parseInt(req.params.manzilNum);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  if (manzilNum < 1 || manzilNum > 7) {
    return res.status(400).json({
      error: 'Manzil number must be between 1 and 7'
    });
  }
  
  const result = filterByManzil(manzilNum, { page, limit });
  res.status(200).json(result);
});

// Filter by revelation type (meccan/medinan)
// GET /filter/revelation/meccan?page=1&limit=20
router.get('/filter/revelation/:type', (req, res) => {
  const type = req.params.type.toLowerCase();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  if (type !== 'meccan' && type !== 'medinan') {
    return res.status(400).json({
      error: 'Revelation type must be either "meccan" or "medinan"'
    });
  }
  
  const result = filterByRevelationType(type, { page, limit });
  res.status(200).json(result);
});

// Filter by verse length (short/medium/long)
// GET /filter/length/short?page=1&limit=20
router.get('/filter/length/:lengthType', (req, res) => {
  const lengthType = req.params.lengthType.toLowerCase();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  if (!['short', 'medium', 'long'].includes(lengthType)) {
    return res.status(400).json({
      error: 'Length type must be "short", "medium", or "long"'
    });
  }
  
  const result = filterByVerseLength(lengthType, { page, limit });
  res.status(200).json(result);
});

/**
 * @swagger
 * /sajdah:
 *   get:
 *     summary: Get all Sajdah (prostration) verses
 *     tags: [Special]
 *     description: Returns all 15 verses where prostration is required or recommended
 *     responses:
 *       200:
 *         description: List of all Sajdah verses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 15
 *                 verses:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Verse'
 *                       - type: object
 *                         properties:
 *                           sajdah_type:
 *                             type: string
 *                             enum: [obligatory, recommended]
 */
router.get('/sajdah', (req, res) => {
  const result = getSajdahVerses();
  res.status(200).json({
    total: result.length,
    verses: result
  });
});

/**
 * @swagger
 * /{surahNum}:
 *   get:
 *     summary: Get complete Surah
 *     tags: [Basic]
 *     description: Retrieve all verses from a specific Surah/Chapter
 *     parameters:
 *       - in: path
 *         name: surahNum
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 114
 *         description: Surah number (1-114)
 *         example: 1
 *     responses:
 *       200:
 *         description: Complete Surah with all verses
 *       404:
 *         description: Surah not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
  const { fields } = req.query; // e.g., ?fields=transliteration,arabic

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

  // Filter fields if requested
  if (fields) {
    const requestedFields = fields.split(',').map(f => f.trim());
    const filterFields = (obj) => {
      const filtered = {};
      requestedFields.forEach(field => {
        if (obj[field] !== undefined) {
          filtered[field] = obj[field];
        }
      });
      return filtered;
    };

    // Handle single verse or range of verses
    if (typeof response === 'object' && !Array.isArray(response)) {
      // Check if it's a single verse (has 'text' or 'arabic_text' property)
      if (response.text || response.arabic_text || response.transliteration) {
        response = filterFields(response);
      } else {
        // It's a collection of verses
        response = Object.keys(response).reduce((acc, key) => {
          acc[key] = filterFields(response[key]);
          return acc;
        }, {});
      }
    }
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
