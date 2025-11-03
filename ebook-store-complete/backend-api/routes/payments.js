const express = require('express');
const asyncHandler = require('express-async-handler');
const Stripe = require('stripe');

const router = express.Router();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });

router.post('/create-payment-intent', asyncHandler(async (req, res) => {
  const { amount, currency = 'usd' } = req.body;

  if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(amount)),
    currency,
    automatic_payment_methods: { enabled: true },
  });

  return res.json({ success: true, data: { clientSecret: paymentIntent.client_secret } });
}));

module.exports = router;


