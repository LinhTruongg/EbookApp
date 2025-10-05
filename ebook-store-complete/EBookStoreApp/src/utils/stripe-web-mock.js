// Web-compatible mock for @stripe/stripe-react-native
export const useStripe = () => ({
  initPaymentSheet: async () => ({ error: null }),
  presentPaymentSheet: async () => ({ error: null }),
});

export const StripeProvider = ({ children }) => children;

export const CardField = () => null;
export const ApplePayButton = () => null;
export const GooglePayButton = () => null;

export default {
  useStripe,
  StripeProvider,
  CardField,
  ApplePayButton,
  GooglePayButton,
};
