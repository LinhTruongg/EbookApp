export async function initPaymentSheet(_: any): Promise<{ error?: { message: string } }> {
  return { error: { message: 'Stripe PaymentSheet is not available on web.' } };
}

export async function presentPaymentSheet(): Promise<{ error?: { message: string } }> {
  return { error: { message: 'Stripe PaymentSheet is not available on web.' } };
}


