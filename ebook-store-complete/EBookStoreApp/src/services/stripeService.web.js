// Web-compatible version of stripeService
import axios from 'axios';
import { STRIPE_CONFIG } from '../config/stripe';

export const stripeService = {
  createPaymentIntent: async (bookData) => {
    try {
      const response = await axios.post(`${STRIPE_CONFIG.apiUrl}/create-payment-intent`, {
        amount: bookData.price,
        currency: bookData.currency,
        bookId: bookData.bookId,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  },

  confirmCardPayment: async (clientSecret, paymentMethodData) => {
    // Mock implementation for web
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          paymentIntentId: `pi_${Date.now()}`,
        });
      }, 2000);
    });
  },

  processAlternativePayment: async (paymentMethod, paymentData) => {
    // Mock implementation for web
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `txn_${Date.now()}`,
        });
      }, 2000);
    });
  },
};
