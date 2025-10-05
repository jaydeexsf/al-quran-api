# Al-Quran API
RESTful Quran API with original Arabic text, English Translation, transliteration, and **Advanced Search** capabilities in plain JSON.

## Features
✨ **Advanced Search** - Multi-word phrases, Arabic text, transliteration, and cross-field search  
📖 Full verses retrieval with Surah names  
🔍 Partial and exact matching  
🌐 RESTful API with comprehensive endpoints  

## Web Data Extraction
*Web-Scraped from [al-quran.info](https://al-quran.info) [Python Script used Included in ./quran-scraping]*  
Entire Quran in JSON in ***./quran-scraping/AL-QURAN_WITH_TRANSLATION_AND_TRANSLITERATION.json***

## Installation & Setup

### Install dependencies
```bash
npm install
```

### Running in development
```bash
npm run dev
```

### Running in production
```bash
npm start
```

Runs on localhost:3000 by default but can be configured using the `PORT` environment variable.

### Running tests
```bash
npm test

# Watch mode
npm run test:watch
```
## API Endpoints

### Basic Endpoints

#### `GET /`
Responds with JSON including properties of the Quran (total surahs, verses, etc.)

#### `GET /:surah`
Get entire Surah/Chapter (1-114)  
**Example:** `/1` - Returns Surah Al-Fatiha with all verses

#### `GET /:surah/:verse`
Get a specific Verse from a Surah  
**Example:** `/1/1` - Returns first verse of Al-Fatiha

#### `GET /:surah/:range`
Get a range of verses  
**Example:** `/1/1-5` - Returns verses 1-5 of Al-Fatiha

---

### 🔍 Advanced Search Endpoints

#### `GET /search?q=<query>&field=<field>&exact=<true|false>`
**Advanced search with full verses details including Surah names**

**Parameters:**
- `q` (required) - Search query (supports multi-word phrases like "ar rahman" or "most merciful")
- `field` (optional) - Search field: `translation` (default), `arabic`, `transliteration`, or `all`
- `exact` (optional) - Exact phrase match: `true` or `false` (default)

**Examples:**
```
/search?q=ar rahman
/search?q=most merciful
/search?q=incurred Your wrath
/search?q=rahman&exact=true
/search?q=الله&field=arabic
```

**Response includes:**
- Total matches
- Surah number and name (English + Arabic)
- Verse number and ID
- Full Arabic text
- Full English translation
- Transliteration

---

#### `GET /search/arabic?q=<arabic_text>`
Search in Arabic text only  
**Example:** `/search/arabic?q=الله` - Find all verses containing "الله"

---

#### `GET /search/transliteration?q=<text>`
Search in transliteration only  
**Example:** `/search/transliteration?q=ar-rahman` - Find verses with "ar-rahman" in transliteration

---

#### `GET /search/all?q=<query>`
Search across all fields (translation, Arabic, and transliteration)  
**Example:** `/search/all?q=rahman` - Find "rahman" in any field

---

#### `GET /corpus/:keyword` *(Legacy endpoint - backward compatible)*
Simple keyword search in English translation  
**Example:** `/corpus/spider` - Returns verses containing "spider"

**Note:** For multi-word searches, use the new `/search` endpoint instead.

---

## Search Examples

### Multi-word phrase search:
```
GET /search?q=not of those who have incurred Your wrath
```

### Long phrase search:
```
GET /search?q=perhaps preferable reading ghayral-maghḍūbi
```

### Arabic search:
```
GET /search/arabic?q=الرحمن
```

### Search all fields:
```
GET /search/all?q=rahman
```

### Exact match:
```
GET /search?q=the opening&exact=true
```

---

## Response Format

### Advanced Search Response:
```json
{
  "total_matches": 2,
  "query": "ar rahman",
  "search_field": "translation",
  "exact_match": false,
  "results": [
    {
      "surah_number": 1,
      "surah_name": "AL-FĀTIḤAH",
      "surah_name_arabic": "الفاتحة",
      "verse_number": 3,
      "verse_id": 3.1,
      "arabic_text": "الرَّحمٰنِ الرَّحيمِ",
      "translation": "the All-beneficent, the All-merciful,",
      "transliteration": "ar-raḥmāni r-raḥīmi"
    }
  ]
}
```

---

## Contributing
Due to the nature of web scraping, the JSON Quran may contain unnecessary information. Feel free to edit and improve the data structure!