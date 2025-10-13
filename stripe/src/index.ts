import dotenv from 'dotenv';
import express from 'express';
import { Stripe } from 'stripe';
import { CarRental } from './model/CarRental';

dotenv.config();

const port = process.env.PORT || 5000;

const server = express();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-09-30.clover', // update if Stripe updates
});

server.get('/', (req, res) => {
  res.send('Running!');
});

server.post('/checkout', async (req, res) => {
  const { item }: { item: CarRental } = req.body;
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
              images: item.image ? [item.image as string] : undefined,
            },
            unit_amount: item.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });
    res.json({
      url: session.url,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

server.listen(5000, () => {
  console.log(`Stripe server running at port ${port}...`);
});
