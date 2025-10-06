const quran = require('../data/AL-QURAN_WITH_TRANSLATION_AND_TRANSLITERATION.json');

/**
 * Normalize text by removing punctuation and extra spaces
 */
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ') // Keep alphanumeric, spaces, and Arabic
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Calculate relevance score for tokenized search
 * Higher score = better match
 */
const calculateRelevanceScore = (text, searchTokens) => {
  const normalizedText = normalizeText(text);
  const textTokens = normalizedText.split(' ');
  
  let score = 0;
  
  // Check for exact phrase match (highest priority)
  const searchPhrase = searchTokens.join(' ');
  if (normalizedText.includes(searchPhrase)) {
    score += 1000; // Exact phrase match
  }
  
  // Check if all tokens are present
  const allTokensPresent = searchTokens.every(token => 
    textTokens.some(textToken => textToken.includes(token))
  );
  
  if (!allTokensPresent) {
    return 0; // No match if not all tokens present
  }
  
  // All tokens present - calculate order score
  score += 100; // Base score for having all tokens
  
  // Check if tokens appear in order
  let lastIndex = -1;
  let inOrder = true;
  
  for (const token of searchTokens) {
    const tokenIndex = textTokens.findIndex((t, idx) => 
      idx > lastIndex && t.includes(token)
    );
    
    if (tokenIndex > lastIndex) {
      lastIndex = tokenIndex;
      score += 10; // Bonus for each token in order
    } else {
      inOrder = false;
    }
  }
  
  if (inOrder) {
    score += 50; // Bonus if all tokens in correct order
  }
  
  // Proximity bonus - tokens closer together = higher score
  const positions = [];
  for (const token of searchTokens) {
    const idx = textTokens.findIndex(t => t.includes(token));
    if (idx !== -1) positions.push(idx);
  }
  
  if (positions.length > 1) {
    const spread = Math.max(...positions) - Math.min(...positions);
    score += Math.max(0, 50 - spread); // Closer = higher score
  }
  
  return score;
};

/**
 * Advanced search function with multiple search modes
 * @param {string} searchTerm - The search query (URL decoded automatically by Express)
 * @param {object} options - Search options
 * @param {boolean} options.exact - Exact phrase match (default: false)
 * @param {boolean} options.partial - Partial word matching (default: true)
 * @param {string} options.field - Field to search: 'translation', 'arabic', 'transliteration', 'all' (default: 'translation')
 * @param {boolean} options.tokenized - Use tokenized search with relevance scoring (default: true)
 */
const advancedSearch = (searchTerm, options = {}) => {
  const { exact = false, partial = true, field = 'translation', tokenized = true } = options;
  const results = [];
  
  // Normalize search term
  const normalizedTerm = searchTerm.toLowerCase().trim();
  
  // Tokenized search mode (new default)
  if (tokenized && !exact) {
    const searchTokens = normalizeText(searchTerm).split(' ').filter(t => t.length > 0);
    
    // Search through all chapters and verses
    Object.keys(quran.chapters).forEach(chapterNum => {
      const chapter = quran.chapters[chapterNum];
      
      Object.keys(chapter.verses).forEach(verseNum => {
        const verse = chapter.verses[verseNum];
        let score = 0;
        
        // Calculate score for each field
        if (field === 'translation' || field === 'all') {
          score = Math.max(score, calculateRelevanceScore(verse.translation_eng, searchTokens));
        }
        
        if (field === 'arabic' || field === 'all') {
          score = Math.max(score, calculateRelevanceScore(verse.content, searchTokens));
        }
        
        if (field === 'transliteration' || field === 'all') {
          score = Math.max(score, calculateRelevanceScore(verse.transliteration, searchTokens));
        }
        
        if (score > 0) {
          results.push({
            surah_number: parseInt(chapterNum),
            surah_name: chapter.surah_name,
            surah_name_arabic: chapter.surah_name_ar,
            verse_number: parseInt(verseNum),
            verse_id: verse.id,
            arabic_text: verse.content,
            translation: verse.translation_eng,
            transliteration: verse.transliteration,
            relevance_score: score
          });
        }
      });
    });
    
    // Sort by relevance score (highest first)
    results.sort((a, b) => b.relevance_score - a.relevance_score);
    
    return results;
  }
  
  // Original exact/partial search mode
  let pattern;
  if (exact) {
    // Exact phrase match
    pattern = new RegExp(normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  } else if (partial) {
    // Partial match - search for the term anywhere in the text
    pattern = new RegExp(normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  } else {
    // Word boundary match (original behavior)
    pattern = new RegExp(`\\b${normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  }

  // Search through all chapters and verses
  Object.keys(quran.chapters).forEach(chapterNum => {
    const chapter = quran.chapters[chapterNum];
    
    Object.keys(chapter.verses).forEach(verseNum => {
      const verse = chapter.verses[verseNum];
      let matchFound = false;
      
      // Determine which field(s) to search
      if (field === 'translation' || field === 'all') {
        if (pattern.test(verse.translation_eng)) {
          matchFound = true;
        }
      }
      
      if (field === 'arabic' || field === 'all') {
        if (pattern.test(verse.content)) {
          matchFound = true;
        }
      }
      
      if (field === 'transliteration' || field === 'all') {
        if (pattern.test(verse.transliteration)) {
          matchFound = true;
        }
      }
      // if (field === "Sepedi") {
      //   if  (patt .test(verse.content)) {
      //     matchFound = false
      //   }
      // }
      
      if (matchFound) {
        results.push({
          surah_number: parseInt(chapterNum),
          surah_name: chapter.surah_name,
          surah_name_arabic: chapter.surah_name_ar,
          verse_number: parseInt(verseNum),
          verse_id: verse.id,
          arabic_text: verse.content,
          translation: verse.translation_eng,
          transliteration: verse.transliteration
        });
      }
    });
  });
  
  return results;
};

/**
 * Simple search (backward compatible with old API)
 * Searches only in English translation with partial matching
 */
const initSearch = (searchTerm) => {
  return new Promise((resolve) => {
    const results = advancedSearch(searchTerm, { partial: true, field: 'translation' });
    
    // Format results to match old API format
    const formattedResults = results.map(r => ({
      surah_no: r.surah_number,
      verse_no: r.verse_number,
      content: r.translation.substring(0, 100) + '...'
    }));
    
    formattedResults.unshift({ "total_matches ": formattedResults.length });
    resolve(formattedResults);
  });
};

module.exports = { initSearch, advancedSearch }