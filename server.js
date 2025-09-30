import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: 'sql311.infinityfree.com', // adapte selon ton hébergement
  port: 3306,
  user: 'if0_40054935', // à adapter
  password: 'JOkKaGiVW2', // à adapter
  database: 'if0_40054935_schrift', // à adapter
  // ssl: { ca: fs.readFileSync('./ca.pem').toString() } // décommente si besoin SSL
};

// Création d'une pool de connexions MySQL (plus efficace et recommandé)
const pool = mysql.createPool(dbConfig);
if (!pool) {
  console.error("Erreur de connexion à la base de données");
  process.exit(1);
} else {
  console.log("Connecté à la base de données MySQL");
}

console.log(pool);

// Exemple : récupérer toutes les guildes
app.get('/api/guildes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM guildes');
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Exemple : récupérer les membres d'une guilde
app.get('/api/guildes/:id/membres', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM membres WHERE guilde_id = ?',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajoute d'autres routes selon tes besoins (scores, rotations, etc.)

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API backend démarrée sur http://localhost:${PORT}`);
});
