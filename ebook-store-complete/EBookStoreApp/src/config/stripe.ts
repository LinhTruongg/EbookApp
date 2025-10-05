// Stripe Configuration
export const STRIPE_CONFIG = {
  // Test keys - Replace with your actual Stripe keys
  publishableKey: 'pk_test_51234567890abcdefghijklmnopqrstuvwxyz', // Your Stripe publishable key
  merchantId: 'merchant.com.ebookstore', // Your Apple Pay merchant ID
  urlScheme: 'ebookstore', // Your app's URL scheme
  
  // Currency and country
  currency: 'vnd', // Vietnamese Dong
  country: 'VN',
  
  // Payment methods
  paymentMethods: {
    card: true,
    applePay: true,
    googlePay: true,
  },
  
  // Test mode
  isTestMode: true,
};

// Stripe API endpoints (for backend integration)
export const STRIPE_API = {
  createPaymentIntent: '/api/stripe/create-payment-intent',
  confirmPayment: '/api/stripe/confirm-payment',
  createCustomer: '/api/stripe/create-customer',
  getPaymentMethods: '/api/stripe/payment-methods',
};

// Payment method types
export const PAYMENT_METHOD_TYPES = {
  CARD: 'card',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  BANK_TRANSFER: 'bank_transfer',
  MOMO: 'momo',
  ZALOPAY: 'zalopay',
  VNPAY: 'vnpay',
} as const;

export type PaymentMethodType = typeof PAYMENT_METHOD_TYPES[keyof typeof PAYMENT_METHOD_TYPES];
