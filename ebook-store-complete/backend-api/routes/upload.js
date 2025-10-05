const express = require('express');
const router = express.Router();

// Placeholder routes - will be implemented later
router.post('/', (req, res) => {
  res.status(501).json({ message: 'Upload endpoint - Not implemented yet' });
});

module.exports = router;
