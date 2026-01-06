import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRequest from './routes/chatRequest.js';
import { initDB } from './config/db.js';

dotenv.config();

// Connect to Database
initDB();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', chatRequest);

app.get('/', (req, res) => {
  res.send('FinCopilot Backend is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
