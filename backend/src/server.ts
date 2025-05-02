// AF: Provides a REST API for flashcard storage and retrieval using Express and PostgreSQL.
// RI: PostgreSQL connection is valid; flashcard table exists.

import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'flashcards',
  password: 'your_password',
  port: 5432,
});

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: string;
}

// Create flashcards table
pool.query(`
  CREATE TABLE IF NOT EXISTS flashcards (
    id VARCHAR PRIMARY KEY,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    difficulty VARCHAR NOT NULL
  )
`);

app.get('/flashcards', async (req, res) => {
  const result = await pool.query('SELECT * FROM flashcards');
  res.json(result.rows);
});

app.post('/add', async (req, res) => {
  const { id, front, back, difficulty } = req.body;
  await pool.query(
    'INSERT INTO flashcards (id, front, back, difficulty) VALUES ($1, $2, $3, $4)',
    [id, front, back, difficulty]
  );
  res.status(201).send('Flashcard added');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
