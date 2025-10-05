const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Al-Quran API',
      version: '1.0.0',
      description: 'RESTful Quran API with original Arabic text, English Translation, transliteration, and Advanced Search capabilities',
      contact: {
        name: 'API Support',
        url: 'https://github.com/jaydeexsf/al-quran-api'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'http://localhost:3111',
        description: 'Alternative development server'
      }
    ],
    tags: [
      {
        name: 'Basic',
        description: 'Basic Quran retrieval endpoints'
      },
      {
        name: 'Search',
        description: 'Advanced search endpoints with relevance scoring'
      },
      {
        name: 'Filters',
        description: 'Filter verses by Juz, Manzil, revelation type, and length'
      },
      {
        name: 'Special',
        description: 'Special verses (Sajdah)'
      }
    ],
    components: {
      schemas: {
        Verse: {
          type: 'object',
          properties: {
            surah_number: {
              type: 'integer',
              example: 1
            },
            surah_name: {
              type: 'string',
              example: 'AL-FĀTIḤAH'
            },
            surah_name_arabic: {
              type: 'string',
              example: 'الفاتحة'
            },
            verse_number: {
              type: 'integer',
              example: 1
            },
            verse_id: {
              type: 'number',
              example: 1.1
            },
            arabic_text: {
              type: 'string',
              example: 'بِسمِ اللَّهِ الرَّحمٰنِ الرَّحيمِ'
            },
            translation: {
              type: 'string',
              example: 'In the Name of Allah,the All-beneficent, the All-merciful.'
            },
            transliteration: {
              type: 'string',
              example: 'bi-smi llāhi r-raḥmāni r-raḥīmi'
            },
            juz: {
              type: 'integer',
              example: 1,
              nullable: true
            },
            sajdah: {
              type: 'string',
              enum: ['obligatory', 'recommended', null],
              nullable: true
            },
            relevance_score: {
              type: 'integer',
              example: 1150,
              description: 'Only present in search results'
            }
          }
        },
        SearchResponse: {
          type: 'object',
          properties: {
            total_matches: {
              type: 'integer',
              example: 5
            },
            query: {
              type: 'string',
              example: 'ar rahman'
            },
            search_field: {
              type: 'string',
              example: 'translation'
            },
            exact_match: {
              type: 'boolean',
              example: false
            },
            results: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Verse'
              }
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Verse'
              }
            },
            total: {
              type: 'integer',
              example: 148
            },
            page: {
              type: 'integer',
              example: 1
            },
            limit: {
              type: 'integer',
              example: 20
            },
            totalPages: {
              type: 'integer',
              example: 8
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Resource not found'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
