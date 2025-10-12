import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const port = process.env.PORT || 5000;

const server = express();

server.listen(5000, () => {
  console.log(`Stripe server running at port ${port}...`);
});
