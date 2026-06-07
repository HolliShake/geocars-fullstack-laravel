/**
 * POST target for Stripe Checkout session creation.
 * - If `VITE_APP_STRIPE_CHECKOUT_URL` is set → direct URL (production or custom).
 * - In dev with no URL → same-origin `/stripe-service/checkout` (Vite proxy → :5000).
 * - Production build without env → `http://localhost:5000/checkout` (override in deploy).
 */
export function getStripeCheckoutEndpoint(): string {
  const raw = import.meta.env.VITE_APP_STRIPE_CHECKOUT_URL as string | undefined;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  if (trimmed) {
    return `${trimmed.replace(/\/$/, '')}/checkout`;
  }
  if (import.meta.env.DEV) {
    return '/stripe-service/checkout';
  }
  return 'http://127.0.0.1:5000/checkout';
}

export type StripeCheckoutItem = {
  id: number;
  /** Amount in smallest currency unit (e.g. PHP centavos). */
  amount: number;
  image?: string;
};

const STRIPE_UNAVAILABLE =
  'Cannot reach Stripe checkout (port 5000). Start it: docker compose up stripe — or cd stripe && npm run dev';

export async function createStripeCheckoutSession(params: {
  item: StripeCheckoutItem;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  let res: Response;
  try {
    res = await fetch(getStripeCheckoutEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item: params.item,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('Load failed')) {
      throw new Error(STRIPE_UNAVAILABLE);
    }
    throw e;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Checkout request failed (${res.status})`);
  }
  const data = (await res.json()) as { url?: string | null };
  if (!data.url) {
    throw new Error('No checkout URL returned');
  }
  return data.url;
}
