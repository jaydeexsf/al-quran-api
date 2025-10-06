const express = require('express');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const indexRouter = require('./routes/index');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Configure helmet with relaxed CSP for Swagger UI
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Swagger API Documentation
const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Furqan API - Al-Quran API Documentation'
};

// Homepage - Swagger UI
app.use('/', swaggerUi.serveFiles(swaggerSpec, swaggerOptions));
app.get('/', swaggerUi.setup(swaggerSpec, swaggerOptions));

// Also available at /api-docs for backward compatibility
app.use('/api-docs', swaggerUi.serveFiles(swaggerSpec, swaggerOptions));
app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerOptions));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api', indexRouter);

app.use((req, res, next) => {
  next(createError.NotFound());
});

app.use(errorHandler);

module.exports = app;
