const express = require('express');
const router = express.Router();

// Placeholder routes - will be implemented later
router.get('/', (req, res) => {
  res.status(501).json({ message: 'Authors endpoint - Not implemented yet' });
});

module.exports = router;
