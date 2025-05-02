// AF: Provides a REST API for flashcard storage and retrieval using Express and PostgreSQL.
// RI: PostgreSQL connection is valid; flashcard table exists.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
// Create flashcards table
pool.query(`
  CREATE TABLE IF NOT EXISTS flashcards (
    id VARCHAR PRIMARY KEY,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    difficulty VARCHAR NOT NULL
  )
`);
app.get('/flashcards', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield pool.query('SELECT * FROM flashcards');
    res.json(result.rows);
}));
app.post('/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, front, back, difficulty } = req.body;
    yield pool.query('INSERT INTO flashcards (id, front, back, difficulty) VALUES ($1, $2, $3, $4)', [id, front, back, difficulty]);
    res.status(201).send('Flashcard added');
}));
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//# sourceMappingURL=server.js.map