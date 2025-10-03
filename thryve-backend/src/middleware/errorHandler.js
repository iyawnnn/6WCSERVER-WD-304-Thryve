function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.name === 'MongoError' && err.code === 11000) {
    // Duplicate key -> user-friendly
    return res.status(409).json({ error: 'Duplicate key error' });
  }
  res.status(500).json({ error: err.message || 'Server error' });
}

module.exports = errorHandler;
