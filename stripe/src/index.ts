import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import { Stripe } from 'stripe';
import { CarRental } from './model/CarRental';

dotenv.config();

const port = Number(process.env.PORT) || 5000;

const server = express();
server.use(cors());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-09-30.clover', // update if Stripe updates
});

/**
 * Stripe webhooks require the raw body. Register this URL in the Stripe Dashboard
 * (same signing secret as STRIPE_WEBHOOK_SECRET). After verification, we optionally
 * forward a minimal payload to Laravel POST /api/Stripe/webhook/ingest.
 */
server.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!whSecret || !sig) {
      res.status(400).send('Webhook secret or Stripe-Signature missing');
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, whSecret);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'constructEvent failed';
      console.error('Stripe webhook signature error:', msg);
      res.status(400).send(`Webhook Error: ${msg}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const ingestUrl = process.env.LARAVEL_STRIPE_INGEST_URL?.replace(/\/$/, '');
      const ingestSecret = process.env.STRIPE_GATEWAY_INGEST_SECRET;

      if (ingestUrl && ingestSecret) {
        const carRentalId = parseInt(session.metadata?.car_rental_id ?? '0', 10);
        if (carRentalId < 1) {
          console.warn('checkout.session.completed missing metadata.car_rental_id', session.id);
        } else {
          try {
            const r = await fetch(`${ingestUrl}/api/Stripe/webhook/ingest`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Stripe-Gateway-Secret': ingestSecret,
              },
              body: JSON.stringify({
                session_id: session.id,
                car_rental_id: carRentalId,
                amount_total: session.amount_total ?? 0,
                currency: session.currency,
              }),
            });
            if (!r.ok) {
              const t = await r.text();
              console.error('Laravel ingest failed:', r.status, t);
            }
          } catch (e) {
            console.error('Laravel ingest request error:', e);
          }
        }
      }
    }

    res.json({ received: true });
  }
);

server.use(express.json());

server.get('/', (req, res) => {
  res.send('Running!');
});

type CheckoutBody = {
  item: CarRental;
  success_url?: string;
  cancel_url?: string;
};

server.post('/checkout', async (req, res) => {
  const { item, success_url, cancel_url } = req.body as CheckoutBody;
  const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

  if (!item?.id || typeof item.amount !== 'number' || item.amount < 1) {
    res.status(400).json({ error: 'Invalid item: id and positive amount (smallest currency unit) are required' });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'php',
            product_data: {
              name: `Car Rental #${item.id}`,
              description: `Rental Payment for #${item.id}`,
              images: item.image ? [String(item.image)] : undefined,
            },
            unit_amount: item.amount,
          },
          quantity: 1,
        },
      ],
      success_url:
        success_url ??
        `${clientOrigin}/renter/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url ?? `${clientOrigin}/renter/checkout/cancel`,
      metadata: {
        car_rental_id: String(item.id),
      },
    });
    res.json({
      url: session.url,
    });
  } catch (err) {
    console.error('Checkout session error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

server.listen(port, () => {
  console.log(`Stripe server running at port ${port}...`);
});
