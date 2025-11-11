const express = require('express');
const asyncHandler = require('express-async-handler');
const { authenticateToken } = require('../middleware/auth');
const { User, Book, UserLibrary, WalletTransaction } = require('../models');

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

  try {
    await WalletTransaction.create({
      userId: user.id,
      type: 'deposit',
      points: pointsToAdd,
      balanceAfter: user.points,
      description: 'Nạp điểm',
    });
  } catch (e) {}

  return res.json({ success: true, data: { pointsAdded: pointsToAdd, balance: user.points } });
}));

router.post('/purchase-book', authenticateToken, asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  if (!bookId) return res.status(400).json({ success: false, message: 'Thiếu bookId' });

  const user = await User.findByPk(req.user.id);
  const book = await Book.findByPk(bookId);
  if (!book) return res.status(404).json({ success: false, message: 'Không tìm thấy sách' });

  // Prevent double purchase
  const existing = await UserLibrary.findOne({ where: { userId: user.id, bookId: book.id } });
  if (existing) {
    return res.json({ success: true, message: 'Đã sở hữu sách này', data: { balance: user.points, alreadyOwned: true } });
  }

  // Determine cost from server-side book price
  const serverCost = Math.max(0, Math.floor(Number(book.pointsRequired || 0)));

  if (serverCost > 0) {
    if (user.points < serverCost) return res.status(400).json({ success: false, message: 'Số điểm không đủ' });
    user.points -= serverCost;
  await user.save();

    try {
      await WalletTransaction.create({
        userId: user.id,
        type: 'purchase',
        points: -serverCost,
        balanceAfter: user.points,
        bookId: book.id,
        description: `Mở khóa sách: ${book.title}`,
      });
    } catch (e) {}
  }

  await UserLibrary.findOrCreate({
    where: { userId: user.id, bookId: book.id },
    defaults: { userId: user.id, bookId: book.id, progress: 0, status: 'purchased' }
  });

  // Note: book remains priced/locked globally; access is enforced per-user via library
  return res.json({ success: true, message: 'Mở khóa sách thành công', data: { balance: user.points, cost: serverCost } });
}));

module.exports = router;

// List wallet transactions
router.get('/transactions', authenticateToken, asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
  const offset = (page - 1) * limit;
  const where = { userId: req.user.id };
  const { count, rows } = await WalletTransaction.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });
  res.json({
    success: true,
    data: {
      total: count,
      page,
      limit,
      items: rows,
    }
  });
}));


