import React from 'react';
import { StripeProvider as RNStripeProvider } from '@stripe/stripe-react-native';

type Props = {
  children: React.ReactNode;
};

export default function StripeProvider({ children }: Props) {
  return (
    <RNStripeProvider publishableKey="pk_test_51RAoO2QX3DZFzXvwo9sw909QaGXYrzEhUW5bvTZx75PcLfWC9eQiE86Bkw9aYxRWpuKG87lHQKHNgGUsQCNIOqc6007oGbDkPm">
      {children}
    </RNStripeProvider>
  );
}


