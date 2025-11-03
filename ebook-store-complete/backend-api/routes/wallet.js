const express = require('express');
const asyncHandler = require('express-async-handler');
const { authenticateToken } = require('../middleware/auth');
const { User, Book, UserLibrary } = require('../models');

const router = express.Router();

// Simple conversion rate: 1 USD cent => 1 point (adjust as needed)
const DEFAULT_RATE = Number(process.env.POINTS_PER_CENT || 1);

router.get('/balance', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  return res.json({ success: true, data: { balance: user.points } });
}));

router.post('/convert', authenticateToken, asyncHandler(async (req, res) => {
  const { amountCents, rate } = req.body;
  const parsedAmount = Math.max(0, Math.floor(Number(amountCents || 0)));
  if (!parsedAmount) return res.status(400).json({ success: false, message: 'amountCents invalid' });
  const pointsToAdd = parsedAmount * Math.max(1, Math.floor(Number(rate || DEFAULT_RATE)));
  const user = await User.findByPk(req.user.id);
  user.points += pointsToAdd;
  await user.save();
  return res.json({ success: true, data: { pointsAdded: pointsToAdd, balance: user.points } });
}));

router.post('/purchase-book', authenticateToken, asyncHandler(async (req, res) => {
  const { bookId, pricePoints } = req.body;
  const cost = Math.max(0, Math.floor(Number(pricePoints || 0)));
  if (!bookId || !cost) return res.status(400).json({ success: false, message: 'Invalid payload' });

  const user = await User.findByPk(req.user.id);
  if (user.points < cost) return res.status(400).json({ success: false, message: 'Số điểm không đủ' });

  const book = await Book.findByPk(bookId);
  if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sách' });

  // Deduct points and grant access
  user.points -= cost;
  await user.save();

  await UserLibrary.findOrCreate({
    where: { userId: user.id, bookId: book.id },
    defaults: { userId: user.id, bookId: book.id, progress: 0, status: 'purchased' }
  });

  return res.json({ success: true, message: 'Mua sách thành công', data: { balance: user.points } });
}));

module.exports = router;


