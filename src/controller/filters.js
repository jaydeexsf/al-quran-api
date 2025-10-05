const quran = require('../data/AL-QURAN_WITH_TRANSLATION_AND_TRANSLITERATION.json');
const metadata = require('../data/quran-metadata.json');

/**
 * Get Juz number for a given surah and verse
 */
const getJuzForVerse = (surahNum, verseNum) => {
  for (const [juzNum, range] of Object.entries(metadata.juz_mapping)) {
    const { start, end } = range;
    
    // Check if verse falls within this Juz
    if (
      (surahNum > start.surah || (surahNum === start.surah && verseNum >= start.verse)) &&
      (surahNum < end.surah || (surahNum === end.surah && verseNum <= end.verse))
    ) {
      return parseInt(juzNum);
    }
  }
  return null;
};

/**
 * Get Manzil number for a given surah
 */
const getManzilForSurah = (surahNum) => {
  for (const [manzilNum, range] of Object.entries(metadata.manzil_mapping)) {
    if (surahNum >= range.start && surahNum <= range.end) {
      return parseInt(manzilNum);
    }
  }
  return null;
};

/**
 * Check if a verse is a Sajdah verse
 */
const isSajdahVerse = (surahNum, verseNum) => {
  return metadata.sajdah_verses.find(
    s => s.surah === surahNum && s.verse === verseNum
  );
};

/**
 * Get verse length category (short/medium/long)
 */
const getVerseLength = (text) => {
  const words = text.split(/\s+/).length;
  if (words <= 10) return 'short';
  if (words <= 30) return 'medium';
  return 'long';
};

/**
 * Filter verses by Juz
 */
const filterByJuz = (juzNum, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const results = [];
  
  const juzRange = metadata.juz_mapping[juzNum];
  if (!juzRange) {
    return { results: [], total: 0, page, limit, totalPages: 0 };
  }
  
  // Iterate through surahs in this Juz
  Object.keys(quran.chapters).forEach(chapterNum => {
    const chapter = quran.chapters[chapterNum];
    const surahNum = parseInt(chapterNum);
    
    Object.keys(chapter.verses).forEach(verseNum => {
      const verse = chapter.verses[verseNum];
      const vNum = parseInt(verseNum);
      
      // Check if this verse is in the Juz range
      if (
        (surahNum > juzRange.start.surah || (surahNum === juzRange.start.surah && vNum >= juzRange.start.verse)) &&
        (surahNum < juzRange.end.surah || (surahNum === juzRange.end.surah && vNum <= juzRange.end.verse))
      ) {
        const sajdah = isSajdahVerse(surahNum, vNum);
        results.push({
          surah_number: surahNum,
          surah_name: chapter.surah_name,
          surah_name_arabic: chapter.surah_name_ar,
          verse_number: vNum,
          verse_id: verse.id,
          arabic_text: verse.content,
          translation: verse.translation_eng,
          transliteration: verse.transliteration,
          juz: juzNum,
          sajdah: sajdah ? sajdah.type : null
        });
      }
    });
  });
  
  // Pagination
  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);
  
  return {
    results: paginatedResults,
    total,
    page,
    limit,
    totalPages,
    juz: juzNum
  };
};

/**
 * Filter verses by revelation type (meccan/medinan)
 */
const filterByRevelationType = (type, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const results = [];
  
  Object.keys(quran.chapters).forEach(chapterNum => {
    const chapter = quran.chapters[chapterNum];
    
    if (chapter.type.toLowerCase() === type.toLowerCase()) {
      Object.keys(chapter.verses).forEach(verseNum => {
        const verse = chapter.verses[verseNum];
        const surahNum = parseInt(chapterNum);
        const vNum = parseInt(verseNum);
        const sajdah = isSajdahVerse(surahNum, vNum);
        
        results.push({
          surah_number: surahNum,
          surah_name: chapter.surah_name,
          surah_name_arabic: chapter.surah_name_ar,
          verse_number: vNum,
          verse_id: verse.id,
          arabic_text: verse.content,
          translation: verse.translation_eng,
          transliteration: verse.transliteration,
          revelation_type: chapter.type,
          juz: getJuzForVerse(surahNum, vNum),
          sajdah: sajdah ? sajdah.type : null
        });
      });
    }
  });
  
  // Pagination
  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);
  
  return {
    results: paginatedResults,
    total,
    page,
    limit,
    totalPages,
    revelation_type: type
  };
};

/**
 * Filter verses by length (short/medium/long)
 */
const filterByVerseLength = (lengthType, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const results = [];
  
  Object.keys(quran.chapters).forEach(chapterNum => {
    const chapter = quran.chapters[chapterNum];
    
    Object.keys(chapter.verses).forEach(verseNum => {
      const verse = chapter.verses[verseNum];
      const verseLength = getVerseLength(verse.translation_eng);
      
      if (verseLength === lengthType.toLowerCase()) {
        const surahNum = parseInt(chapterNum);
        const vNum = parseInt(verseNum);
        const sajdah = isSajdahVerse(surahNum, vNum);
        
        results.push({
          surah_number: surahNum,
          surah_name: chapter.surah_name,
          surah_name_arabic: chapter.surah_name_ar,
          verse_number: vNum,
          verse_id: verse.id,
          arabic_text: verse.content,
          translation: verse.translation_eng,
          transliteration: verse.transliteration,
          verse_length: verseLength,
          juz: getJuzForVerse(surahNum, vNum),
          sajdah: sajdah ? sajdah.type : null
        });
      }
    });
  });
  
  // Pagination
  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);
  
  return {
    results: paginatedResults,
    total,
    page,
    limit,
    totalPages,
    verse_length: lengthType
  };
};

/**
 * Get all Sajdah verses
 */
const getSajdahVerses = () => {
  const results = [];
  
  metadata.sajdah_verses.forEach(sajdahInfo => {
    const chapter = quran.chapters[sajdahInfo.surah];
    const verse = chapter.verses[sajdahInfo.verse];
    
    if (verse) {
      results.push({
        surah_number: sajdahInfo.surah,
        surah_name: chapter.surah_name,
        surah_name_arabic: chapter.surah_name_ar,
        verse_number: sajdahInfo.verse,
        verse_id: verse.id,
        arabic_text: verse.content,
        translation: verse.translation_eng,
        transliteration: verse.transliteration,
        sajdah_type: sajdahInfo.type,
        juz: getJuzForVerse(sajdahInfo.surah, sajdahInfo.verse)
      });
    }
  });
  
  return results;
};

/**
 * Filter by Manzil
 */
const filterByManzil = (manzilNum, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const results = [];
  
  const manzilRange = metadata.manzil_mapping[manzilNum];
  if (!manzilRange) {
    return { results: [], total: 0, page, limit, totalPages: 0 };
  }
  
  // Get all verses in surahs within this Manzil
  for (let surahNum = manzilRange.start; surahNum <= manzilRange.end; surahNum++) {
    const chapter = quran.chapters[surahNum];
    if (!chapter) continue;
    
    Object.keys(chapter.verses).forEach(verseNum => {
      const verse = chapter.verses[verseNum];
      const vNum = parseInt(verseNum);
      const sajdah = isSajdahVerse(surahNum, vNum);
      
      results.push({
        surah_number: surahNum,
        surah_name: chapter.surah_name,
        surah_name_arabic: chapter.surah_name_ar,
        verse_number: vNum,
        verse_id: verse.id,
        arabic_text: verse.content,
        translation: verse.translation_eng,
        transliteration: verse.transliteration,
        manzil: manzilNum,
        juz: getJuzForVerse(surahNum, vNum),
        sajdah: sajdah ? sajdah.type : null
      });
    });
  }
  
  // Pagination
  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);
  
  return {
    results: paginatedResults,
    total,
    page,
    limit,
    totalPages,
    manzil: manzilNum
  };
};

module.exports = {
  filterByJuz,
  filterByRevelationType,
  filterByVerseLength,
  getSajdahVerses,
  filterByManzil,
  getJuzForVerse,
  getManzilForSurah,
  isSajdahVerse
};
