const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios'); // Pour faire des requêtes HTTP vers d'autres microservices

const app = express();
app.use(express.json());
const PORT = 8001; // On utilise le port 8001 car le Patient est sur le 8000

const db = new sqlite3.Database('./rendezvous.db', (err) => {
    if (err) console.error(err.message);
    console.log('Connecté à la base de données des rendez-vous.');
});

db.run(`CREATE TABLE IF NOT EXISTS rendezvous (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    medecin_nom TEXT,
    date_heure TEXT
)`);

// 2. Route pour créer un rendez-vous (La communication inter-services)
app.post('/rendezvous/', async (req, res) => {
    const { patient_id, medecin_nom, date_heure } = req.body;

    try {
        const patientResponse = await axios.get(`http://patient:8000/patients/${patient_id}`);

        if (patientResponse.status === 200) {

            const sql = 'INSERT INTO rendezvous (patient_id, medecin_nom, date_heure) VALUES (?, ?, ?)';

            db.run(sql, [patient_id, medecin_nom, date_heure], async function (err) {
                if (err) return res.status(500).json({ error: err.message });

                try {
                    await axios.post('http://factures:8002/factures/', {
                        patient_id: patient_id,
                        montant: 300.0 // Montant par défaut d'une consultation
                    });
                    console.log("Facture générée automatiquement via le service Facturation.");
                } catch (fErr) {
                    console.error("Erreur lors de la génération de la facture:", fErr.message);
                }

                res.status(201).json({
                    message: "Rendez-vous et Facture créés avec succès !",
                    rendezvous_id: this.lastID,
                    patient_info: patientResponse.data
                });
            });
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: "Ce patient n'existe pas dans le système." });
        }
        res.status(500).json({ error: "Erreur de communication avec le service Patient." });
    }
});

app.listen(PORT, () => {
    console.log(`Microservice Rendez-vous démarré sur http://127.0.0.1:${PORT}`);
});
