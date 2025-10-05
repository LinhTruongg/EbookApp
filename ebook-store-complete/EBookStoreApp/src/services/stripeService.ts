import { STRIPE_CONFIG, STRIPE_API, PAYMENT_METHOD_TYPES, PaymentMethodType } from '../config/stripe';
import { apiService } from './api';

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

export interface BookPurchaseData {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  price: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
}

class StripeService {
  private stripe: any = null;

  // Initialize Stripe
  async initializeStripe() {
    try {
      // This would typically be done in the app initialization
      console.log('Stripe initialized with config:', STRIPE_CONFIG);
      return true;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      return false;
    }
  }

  // Create payment intent on backend
  async createPaymentIntent(bookData: BookPurchaseData): Promise<PaymentIntent | null> {
    try {
      const response = await apiService.post(STRIPE_API.createPaymentIntent, {
        bookId: bookData.bookId,
        bookTitle: bookData.bookTitle,
        bookAuthor: bookData.bookAuthor,
        amount: bookData.price,
        currency: bookData.currency,
        customerEmail: bookData.customerEmail,
        customerName: bookData.customerName,
      });

      if (response.data.success) {
        return response.data.paymentIntent;
      }
      return null;
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      return null;
    }
  }

  // Process card payment
  async processCardPayment(
    paymentIntent: PaymentIntent,
    cardDetails: any
  ): Promise<PaymentResult> {
    try {
      // This would use the actual Stripe SDK
      // For now, we'll simulate the payment process
      console.log('Processing card payment:', { paymentIntent, cardDetails });
      
      // Simulate API call to confirm payment
      const response = await apiService.post(STRIPE_API.confirmPayment, {
        paymentIntentId: paymentIntent.id,
        paymentMethod: PAYMENT_METHOD_TYPES.CARD,
        cardDetails,
      });

      if (response.data.success) {
        return {
          success: true,
          paymentIntentId: paymentIntent.id,
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Payment failed',
        };
      }
    } catch (error) {
      console.error('Card payment failed:', error);
      return {
        success: false,
        error: 'Payment processing failed',
      };
    }
  }

  // Process Apple Pay payment
  async processApplePayPayment(
    paymentIntent: PaymentIntent,
    applePayDetails: any
  ): Promise<PaymentResult> {
    try {
      console.log('Processing Apple Pay payment:', { paymentIntent, applePayDetails });
      
      const response = await apiService.post(STRIPE_API.confirmPayment, {
        paymentIntentId: paymentIntent.id,
        paymentMethod: PAYMENT_METHOD_TYPES.APPLE_PAY,
        applePayDetails,
      });

      if (response.data.success) {
        return {
          success: true,
          paymentIntentId: paymentIntent.id,
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Apple Pay payment failed',
        };
      }
    } catch (error) {
      console.error('Apple Pay payment failed:', error);
      return {
        success: false,
        error: 'Apple Pay processing failed',
      };
    }
  }

  // Process Google Pay payment
  async processGooglePayPayment(
    paymentIntent: PaymentIntent,
    googlePayDetails: any
  ): Promise<PaymentResult> {
    try {
      console.log('Processing Google Pay payment:', { paymentIntent, googlePayDetails });
      
      const response = await apiService.post(STRIPE_API.confirmPayment, {
        paymentIntentId: paymentIntent.id,
        paymentMethod: PAYMENT_METHOD_TYPES.GOOGLE_PAY,
        googlePayDetails,
      });

      if (response.data.success) {
        return {
          success: true,
          paymentIntentId: paymentIntent.id,
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Google Pay payment failed',
        };
      }
    } catch (error) {
      console.error('Google Pay payment failed:', error);
      return {
        success: false,
        error: 'Google Pay processing failed',
      };
    }
  }

  // Process alternative payment methods (MoMo, ZaloPay, VNPay)
  async processAlternativePayment(
    paymentMethod: PaymentMethodType,
    bookData: BookPurchaseData,
    paymentDetails: any
  ): Promise<PaymentResult> {
    try {
      console.log('Processing alternative payment:', { paymentMethod, bookData, paymentDetails });
      
      // For alternative payment methods, we would integrate with their respective APIs
      // For now, we'll simulate the process
      const response = await apiService.post('/api/payments/alternative', {
        paymentMethod,
        bookData,
        paymentDetails,
      });

      if (response.data.success) {
        return {
          success: true,
          paymentIntentId: response.data.transactionId,
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Alternative payment failed',
        };
      }
    } catch (error) {
      console.error('Alternative payment failed:', error);
      return {
        success: false,
        error: 'Alternative payment processing failed',
      };
    }
  }

  // Validate payment method
  validatePaymentMethod(paymentMethod: PaymentMethodType): boolean {
    const validMethods = Object.values(PAYMENT_METHOD_TYPES);
    return validMethods.includes(paymentMethod);
  }

  // Get supported payment methods
  getSupportedPaymentMethods(): PaymentMethodType[] {
    return Object.values(PAYMENT_METHOD_TYPES);
  }

  // Format amount for display
  formatAmount(amount: number, currency: string = 'vnd'): string {
    if (currency === 'vnd') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }

  // Convert VND to cents (for Stripe)
  convertToCents(amount: number): number {
    // VND doesn't use cents, so we return the amount as is
    return amount;
  }
}

// Export singleton instance
export const stripeService = new StripeService();

// Mock Stripe hooks for web compatibility
export const useStripe = () => ({
  initPaymentSheet: async () => ({ error: null }),
  presentPaymentSheet: async () => ({ error: null }),
});

export const StripeProvider = ({ children }: { children: React.ReactNode }) => children;
