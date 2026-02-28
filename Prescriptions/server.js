const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

const app = express();
app.use(express.json());
const PORT = 8005;

// Initialisation de la base de données relationnelle locale
const db = new sqlite3.Database('./prescriptions.db', (err) => {
    if (err) console.error(err.message);
    console.log('Connecté à la base de données des prescriptions.');
});

db.run(`CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    medecin_nom TEXT,
    medicament TEXT,
    posologie TEXT
)`);

app.post('/prescriptions/', async (req, res) => {
    const { patient_id, medecin_nom, medicament, posologie } = req.body;

    try {
        // 1. VÉRIFICATION DE SÉCURITÉ : Interrogation du microservice DossiersMed (Port 8004)
        const dossierResponse = await axios.get(`http://dossiersmed:8004/dossiers/${patient_id}`);
        const allergies = dossierResponse.data.allergies || [];

        // 2. LOGIQUE MÉTIER : Le patient est-il allergique ?
        if (allergies.includes(medicament)) {
            console.log(`[ALERTE] Tentative de prescription bloquée pour le patient ${patient_id}`);
            return res.status(400).json({
                alerte_critique: "DANGER ! Le patient est allergique à ce médicament.",
                medicament_bloque: medicament
            });
        }

        // 3. VALIDATION : Si aucune allergie, on enregistre la prescription
        const sql = 'INSERT INTO prescriptions (patient_id, medecin_nom, medicament, posologie) VALUES (?, ?, ?, ?)';
        db.run(sql, [patient_id, medecin_nom, medicament, posologie], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            console.log(`Prescription de ${medicament} validée.`);
            res.status(201).json({
                message: "Prescription créée avec succès",
                prescription_id: this.lastID
            });
        });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: "Impossible de prescrire : Dossier médical introuvable." });
        }
        res.status(500).json({ error: "Erreur de communication avec le service DossiersMed." });
    }
});

app.listen(PORT, () => {
    console.log(`Microservice Prescriptions démarré sur http://127.0.0.1:${PORT}`);
});
