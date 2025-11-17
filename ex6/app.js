const express = require('express');
const requestLogger = require("./middleware/requestLogger");
const booksRouter = require('./routes/books.routes');
const errorHandler = require('./middleware/errorHandler');
const app = express();

// Middleware globalne
app.use(express.json()); // Parser JSON
app.use(requestLogger);  // Logowanie żądań

// Endpoint główny zwracający dostępne endpointy
app.get('/api', (req, res) => {
  res.json({
    message: "Library Management API",
    version: "1.0.0",
    endpoints: {
      books: "/api/books",
      health: "/api/health"
    },
    _links: {
      self: { href: "/api", method: "GET" },
      books: { href: "/api/books", method: "GET" }
    }
  });
});

// Endpoint health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Rejestracja routerów
app.use('/api/books', booksRouter);

// Obsługa nieistniejących ścieżek (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: '/api'
  });
});

// Obsługa błędów (zawsze na końcu)
app.use(errorHandler);

module.exports = app;