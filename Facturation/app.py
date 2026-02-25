from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)
PORT = 8002

# Initialisation de la base de données SQLite pour la facturation
def init_db():
    conn = sqlite3.connect('facturation.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS factures (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    patient_id INTEGER, 
                    montant REAL, 
                    statut TEXT
                )''')
    conn.commit()
    conn.close()

init_db()

@app.route('/factures/', methods=['POST'])
def creer_facture():
    data = request.get_json()
    
    # On vérifie qu'on a bien reçu l'ID du patient
    patient_id = data.get('patient_id')
    if not patient_id:
        return jsonify({"error": "patient_id est requis"}), 400
        
    # Montant arbitraire pour une consultation standard (ex: 300 MAD)
    montant = data.get('montant', 300.0) 
    
    conn = sqlite3.connect('facturation.db')
    c = conn.cursor()
    c.execute("INSERT INTO factures (patient_id, montant, statut) VALUES (?, ?, 'En attente')", 
              (patient_id, montant))
    facture_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        "message": "Facture générée avec succès", 
        "facture_id": facture_id, 
        "montant": montant,
        "statut": "En attente"
    }), 201

if __name__ == '__main__':
    print(f"Microservice Facturation démarré sur http://127.0.0.1:{PORT}")
    app.run(port=PORT)
