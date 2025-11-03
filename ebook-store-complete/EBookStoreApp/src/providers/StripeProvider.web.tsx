import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default function StripeProvider({ children }: Props) {
  return <>{children}</>;
}


