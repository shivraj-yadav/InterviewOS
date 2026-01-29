import express from 'express';
import { ENV } from './lib/env.js';
const app = express();
const PORT = ENV.PORT;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});