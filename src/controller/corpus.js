const quran = require('../data/AL-QURAN_WITH_TRANSLATION_AND_TRANSLITERATION.json');

/**
 * Advanced search function with multiple search modes
 * @param {string} searchTerm - The search query (URL decoded automatically by Express)
 * @param {object} options - Search options
 * @param {boolean} options.exact - Exact phrase match (default: false)
 * @param {boolean} options.partial - Partial word matching (default: true)
 * @param {string} options.field - Field to search: 'translation', 'arabic', 'transliteration', 'all' (default: 'translation')
 */
const advancedSearch = (searchTerm, options = {}) => {
  const { exact = false, partial = true, field = 'translation' } = options;
  const results = [];
  
  // Normalize search term
  const normalizedTerm = searchTerm.toLowerCase().trim();
  
  // Create regex pattern based on search mode
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