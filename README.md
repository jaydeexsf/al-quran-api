# Al-Quran API
RESTful Quran API with original Arabic text, English Translation, transliteration, and **Advanced Search** capabilities in plain JSON.

## Features
✨ **Advanced Search** - Multi-word phrases, Arabic text, transliteration, and cross-field search  
📖 Full verse retrieval with Surah names  
🔍 Partial and exact matching with relevance scoring  
📚 **Juz & Manzil filtering** - Navigate by Quran divisions  
🕌 **Sajdah verses** - All prostration verses flagged  
📍 **Revelation type filtering** - Meccan vs Medinan verses  
📏 **Verse length filtering** - Short, medium, or long verses  
📄 **Pagination** - All endpoints support pagination  
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

---

## 📚 Interactive API Documentation

**Swagger UI Documentation:** `http://localhost:3000/api-docs`

Once the server is running, visit the Swagger UI for:
- ✅ **Interactive API testing** - Try endpoints directly in your browser
- ✅ **Complete request/response examples**
- ✅ **Parameter descriptions and validation**
- ✅ **Schema definitions**

**Swagger JSON:** `http://localhost:3000/api-docs.json`

---
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
**Intelligent tokenized search with relevance scoring and full verse details**

**✨ Smart Features:**
- **Ignores punctuation** - Searches work even with different punctuation marks
- **Relevance scoring** - Results sorted by best match first
- **Long phrase support** - Handles multi-word and long phrases
- **Flexible matching** - Finds verses even if word order varies slightly

**Parameters:**
- `q` (required) - Search query (supports multi-word phrases, long text, any punctuation)
- `field` (optional) - Search field: `translation` (default), `arabic`, `transliteration`, or `all`
- `exact` (optional) - Exact phrase match: `true` or `false` (default uses smart tokenized search)

**Examples:**
```
/search?q=ar rahman
/search?q=most merciful
/search?q=is it you who know better, or Allah?' And who is a greater wrongdoer
/search?q=incurred Your wrath
/search?q=rahman&exact=true
/search?q=الله&field=arabic
```

**Scoring System:**
- **Highest score** - Exact phrase match with same word order
- **High score** - All words present in correct order
- **Medium score** - All words present but different order
- **Results automatically sorted by relevance!**

**Response includes:**
- Total matches
- Surah number and name (English + Arabic)
- Verse number and ID
- Full Arabic text
- Full English translation
- Transliteration
- Relevance score (higher = better match)

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

### 📚 Filtering & Navigation Endpoints

#### `GET /juz/:juzNum?page=1&limit=20`
Get verses from a specific Juz (1-30)  
**Example:** `/juz/1?page=1&limit=20` - First 20 verses of Juz 1

#### `GET /manzil/:manzilNum?page=1&limit=20`
Get verses from a specific Manzil (1-7)  
**Example:** `/manzil/1?page=1&limit=50` - First 50 verses of Manzil 1

#### `GET /filter/revelation/:type?page=1&limit=20`
Filter verses by revelation type (`meccan` or `medinan`)  
**Examples:**
- `/filter/revelation/meccan?page=1&limit=20` - Meccan verses
- `/filter/revelation/medinan?page=1&limit=20` - Medinan verses

#### `GET /filter/length/:lengthType?page=1&limit=20`
Filter verses by length (`short`, `medium`, or `long`)  
**Examples:**
- `/filter/length/short` - Short verses (≤10 words)
- `/filter/length/medium` - Medium verses (11-30 words)
- `/filter/length/long` - Long verses (>30 words)

#### `GET /sajdah`
Get all Sajdah (prostration) verses  
**Returns:** All 15 Sajdah verses with type (obligatory/recommended)

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
      "transliteration": "ar-raḥmāni r-raḥīmi",
      "relevance_score": 1150
    }
  ]
}
```

### Filter Response (with Pagination):
```json
{
  "results": [
    {
      "surah_number": 1,
      "surah_name": "AL-FĀTIḤAH",
      "surah_name_arabic": "الفاتحة",
      "verse_number": 1,
      "verse_id": 1.1,
      "arabic_text": "بِسمِ اللَّهِ الرَّحمٰنِ الرَّحيمِ",
      "translation": "In the Name of Allah,the All-beneficent, the All-merciful.",
      "transliteration": "bi-smi llāhi r-raḥmāni r-raḥīmi",
      "juz": 1,
      "sajdah": null
    }
  ],
  "total": 148,
  "page": 1,
  "limit": 20,
  "totalPages": 8,
  "juz": 1
}
```

### Sajdah Verses Response:
```json
{
  "total": 15,
  "verses": [
    {
      "surah_number": 7,
      "surah_name": "AL-AʿRĀF",
      "verse_number": 206,
      "sajdah_type": "recommended",
      "juz": 9,
      "arabic_text": "...",
      "translation": "...",
      "transliteration": "..."
    }
  ]
}
```

---

## Pagination

All filter endpoints support pagination with query parameters:
- `?page=1` - Page number (default: 1)
- `?limit=20` - Results per page (default: 20)

**Example:**
```
GET /juz/1?page=2&limit=50
GET /filter/revelation/meccan?page=1&limit=100
```

---

## API Summary

| Endpoint | Description | Pagination |
|----------|-------------|------------|
| `GET /` | Quran statistics | ❌ |
| `GET /:surah` | Full Surah | ❌ |
| `GET /:surah/:verse` | Specific verse | ❌ |
| `GET /:surah/:range` | Verse range | ❌ |
| `GET /search?q=...` | Advanced search | ❌ |
| `GET /search/arabic?q=...` | Arabic search | ❌ |
| `GET /search/transliteration?q=...` | Transliteration search | ❌ |
| `GET /search/all?q=...` | Search all fields | ❌ |
| `GET /corpus/:keyword` | Legacy search | ❌ |
| `GET /juz/:num` | Filter by Juz | ✅ |
| `GET /manzil/:num` | Filter by Manzil | ✅ |
| `GET /filter/revelation/:type` | Meccan/Medinan | ✅ |
| `GET /filter/length/:type` | Verse length | ✅ |
| `GET /sajdah` | Prostration verses | ❌ |

---

## Contributing
Due to the nature of web scraping, the JSON Quran may contain unnecessary information. Feel free to edit and improve the data structure!

## License
Open source - feel free to use and modify for your projects.