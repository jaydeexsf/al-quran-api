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

**Swagger UI Documentation:** `http://localhost:3000/` or `http://localhost:3000/api-docs`

Once the server is running, visit the Swagger UI for:
- ✅ **Interactive API testing** - Try endpoints directly in your browser
- ✅ **Complete request/response examples**
- ✅ **Parameter descriptions and validation**
- ✅ **Schema definitions**

**Swagger JSON:** `http://localhost:3000/api-docs.json`

**Base URL:** All API endpoints are prefixed with `/api`

---
## API Endpoints

### Basic Endpoints

#### `GET /api/`
Responds with JSON including properties of the Quran (total surahs, verses, etc.)

#### `GET /api/:surah?fields=<field1,field2>`
Get entire Surah/Chapter (1-114)  
**Example:** `/api/1` - Returns Surah Al-Fatiha with all verses  
**With field filtering:** `/api/1?fields=transliteration` - Returns only transliteration for all verses in Surah 1

#### `GET /api/:surah/:verse?fields=<field1,field2>`
Get a specific Verse from a Surah  
**Example:** `/api/1/1` - Returns first verse of Al-Fatiha  
**With field filtering:** `/api/1/1?fields=transliteration` - Returns only transliteration  
**Multiple fields:** `/api/1/1?fields=transliteration,content` - Returns transliteration and Arabic text

**Available fields:**
- `id` - Verse ID
- `content` - Arabic text
- `translation_eng` - English translation
- `transliteration` - Transliteration

#### `GET /api/:surah/:range?fields=<field1,field2>`
Get a range of verses  
**Example:** `/api/1/1-5` - Returns verses 1-5 of Al-Fatiha  
**With field filtering:** `/api/1/1-5?fields=transliteration` - Returns only transliteration for verses 1-5

---

### 🔍 Advanced Search Endpoints

#### `GET /api/search?q=<query>&field=<field>&exact=<true|false>`
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
/api/search?q=ar%20rahman
/api/search?q=most%20merciful
/api/search?q=is%20it%20you%20who%20know%20better%2C%20or%20Allah%3F%27%20And%20who%20is%20a%20greater%20wrongdoer
/api/search?q=incurred%20Your%20wrath
/api/search?q=rahman&exact=true
/api/search?q=الله&field=arabic
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

#### `GET /api/search/arabic?q=<arabic_text>`
Search in Arabic text only  
**Example:** `/api/search/arabic?q=الله` - Find all verses containing "الله"

---

#### `GET /api/search/transliteration?q=<text>`
Search in transliteration only  
**Example:** `/api/search/transliteration?q=ar-rahman` - Find verses with "ar-rahman" in transliteration

---

#### `GET /api/search/all?q=<query>`
Search across all fields (translation, Arabic, and transliteration)  
**Example:** `/api/search/all?q=rahman` - Find "rahman" in any field

---

#### `GET /api/corpus/:keyword` *(Legacy endpoint - backward compatible)*
Simple keyword search in English translation  
**Example:** `/api/corpus/spider` - Returns verses containing "spider"

**Note:** For multi-word searches, use the new `/api/search` endpoint instead.

---

### 📚 Filtering & Navigation Endpoints

#### `GET /api/juz/:juzNum?page=1&limit=20`
Get verses from a specific Juz (1-30)  
**Example:** `/api/juz/1?page=1&limit=20` - First 20 verses of Juz 1

#### `GET /api/manzil/:manzilNum?page=1&limit=20`
Get verses from a specific Manzil (1-7)  
**Example:** `/api/manzil/1?page=1&limit=50` - First 50 verses of Manzil 1

#### `GET /api/filter/revelation/:type?page=1&limit=20`
Filter verses by revelation type (`meccan` or `medinan`)  
**Examples:**
- `/api/filter/revelation/meccan?page=1&limit=20` - Meccan verses
- `/api/filter/revelation/medinan?page=1&limit=20` - Medinan verses

#### `GET /api/filter/length/:lengthType?page=1&limit=20`
Filter verses by length (`short`, `medium`, or `long`)  
**Examples:**
- `/api/filter/length/short` - Short verses (≤10 words)
- `/api/filter/length/medium` - Medium verses (11-30 words)
- `/api/filter/length/long` - Long verses (>30 words)

#### `GET /api/sajdah`
Get all Sajdah (prostration) verses  
**Returns:** All 15 Sajdah verses with type (obligatory/recommended)

---

## Examples

### Field Filtering Examples:

#### Get only transliteration of entire Surah:
```
GET /api/1?fields=transliteration
```

#### Get only transliteration of a verse:
```
GET /api/1/1?fields=transliteration
```

#### Get Arabic text and transliteration:
```
GET /api/1/1?fields=content,transliteration
```

#### Get only transliteration for a range of verses:
```
GET /api/1/1-7?fields=transliteration
```

---

### Search Examples:

#### Multi-word phrase search:
```
GET /api/search?q=not%20of%20those%20who%20have%20incurred%20Your%20wrath
```

#### Long phrase search:
```
GET /api/search?q=perhaps%20preferable%20reading%20ghayral-maghḍūbi
```

#### Arabic search:
```
GET /api/search/arabic?q=الرحمن
```

#### Search all fields:
```
GET /api/search/all?q=rahman
```

#### Exact match:
```
GET /api/search?q=the%20opening&exact=true
```

---

## Response Format

### Field Filtered Response:
```json
// GET /api/1/1?fields=transliteration
{
  "transliteration": "bi-smi llāhi r-raḥmāni r-raḥīmi"
}

// GET /api/1/1?fields=content,transliteration
{
  "content": "بِسمِ اللَّهِ الرَّحمٰنِ الرَّحيمِ",
  "transliteration": "bi-smi llāhi r-raḥmāni r-raḥīmi"
}
```

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
GET /api/juz/1?page=2&limit=50
GET /api/filter/revelation/meccan?page=1&limit=100
```

---

## API Summary

| Endpoint | Description | Field Filtering | Pagination |
|----------|-------------|-----------------|------------|
| `GET /api/` | Quran statistics | ❌ | ❌ |
| `GET /api/:surah` | Full Surah | ✅ | ❌ |
| `GET /api/:surah/:verse` | Specific verse | ✅ | ❌ |
| `GET /api/:surah/:range` | Verse range | ✅ | ❌ |
| `GET /api/search?q=...` | Advanced search | ❌ | ❌ |
| `GET /api/search/arabic?q=...` | Arabic search | ❌ | ❌ |
| `GET /api/search/transliteration?q=...` | Transliteration search | ❌ | ❌ |
| `GET /api/search/all?q=...` | Search all fields | ❌ | ❌ |
| `GET /api/corpus/:keyword` | Legacy search | ❌ | ❌ |
| `GET /api/juz/:num` | Filter by Juz | ❌ | ✅ |
| `GET /api/manzil/:num` | Filter by Manzil | ❌ | ✅ |
| `GET /api/filter/revelation/:type` | Meccan/Medinan | ❌ | ✅ |
| `GET /api/filter/length/:type` | Verse length | ❌ | ✅ |
| `GET /api/sajdah` | Prostration verses | ❌ | ❌ |

---

## Contributing
Due to the nature of web scraping, the JSON Quran may contain unnecessary information. Feel free to edit and improve the data structure!

## License
Open source - feel free to use and modify for your projects.